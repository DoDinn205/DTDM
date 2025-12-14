const express = require("express");
const mongoose = require("mongoose");
const Folder = require("../models/folderModel");
const File = require("../models/fileModel");
const { requireAuth } = require("../middleware/auth");
const { writeActivity } = require("../log");

const router = express.Router();

/**
 * DELETE API — ONLY SOFT DELETE
 * Không xóa vĩnh viễn
 * Không đụng S3
 * Không update quota
 * Chỉ chuyển file/folder sang trạng thái trash
 */

router.post("/delete", requireAuth, async (req, res) => {
  try {
    const owner = req.user.email;
    const { id } = req.body;

    if (!id) return res.status(400).json({ message: "id is required" });
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid id" });

    // -----------------------------------------
    // 1) CHECK FILE FIRST
    // -----------------------------------------
    const file = await File.findById(id);

    if (file) {
      if (String(file.owner) !== String(owner)) {
        return res.status(403).json({ message: "Forbidden: only owner can delete this file" });
      }

      if (file.trashed === true) {
        return res.json({ message: "File already in trash", type: "file", id });
      }

      file.trashed = true;
      file.trashedAt = new Date();
      file.trashedBy = owner;
      await file.save();

      try {
        writeActivity(`SOFT DELETE FILE id=${id} owner=${owner}`, 'TRASHED', `name=${file.filename}`);
      } catch (_) {}

      return res.json({ message: "File moved to trash", type: "file", id });
    }

    // -----------------------------------------
    // 2) CHECK FOLDER
    // -----------------------------------------
    const folder = await Folder.findById(id);
    if (!folder) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (String(folder.owner) !== String(owner)) {
      return res.status(403).json({ message: "Forbidden: only owner can delete this folder" });
    }

    if (folder.trashed === true) {
      return res.json({ message: "Folder already in trash", type: "folder", id });
    }

    // -----------------------------------------
    // 3) SOFT DELETE WHOLE FOLDER TREE (recursive)
    // -----------------------------------------
    const allFolders = await Folder.find({ owner }).lean();
    const toTrash = [];

    const collectChildren = (fid) => {
      toTrash.push(fid);
      allFolders
        .filter(f => f.parent?.toString() === fid.toString())
        .forEach(f => collectChildren(f._id.toString()));
    };

    collectChildren(id);

    const now = new Date();

    await Folder.updateMany(
      { _id: { $in: toTrash } },
      { $set: { trashed: true, trashedAt: now, trashedBy: owner } }
    );

    await File.updateMany(
      { owner, folder: { $in: toTrash } },
      { $set: { trashed: true, trashedAt: now, trashedBy: owner } }
    );

    try {
      writeActivity(
        `SOFT DELETE FOLDER id=${id} owner=${owner}`,
        'TRASHED',
        `folders=${toTrash.length}`
      );
    } catch (_) {}

    return res.json({
      message: "Folder moved to trash (recursive)",
      type: "folder",
      id,
      trashedFolders: toTrash.length
    });

  } catch (err) {
    console.error("Soft delete error:", err);
    try { writeActivity(`DELETE ITEM`, 'FAILED', err.message); } catch (_) {}
    res.status(500).json({ message: "Soft delete failed", error: err.message });
  }
});

module.exports = router;
