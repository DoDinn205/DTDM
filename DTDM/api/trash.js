require("dotenv").config()
const express = require('express');
const mongoose = require('mongoose');
const AWS = require('aws-sdk');
const Folder = require('../models/folderModel');
const File = require('../models/fileModel');
const User = require('../models/userModel');
const { requireAuth } = require('../middleware/auth');
const { writeActivity } = require('../log');

const router = express.Router();

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

/** ===============================
 *  COMMON HELPER: RECUSIVE TREE
 *  =============================== */
async function gatherFolderTree(owner, rootId) {
  const allFolders = await Folder.find({ owner }).lean();
  const list = [];

  const collect = (fid) => {
    list.push(fid);
    allFolders
      .filter(f => String(f.parent) === String(fid))
      .forEach(f => collect(f._id.toString()));
  };

  collect(rootId);
  return list; // array of folderIds
}

/** ===============================
 *  STORAGE USAGE HELPER
 *  =============================== */
async function calculateUsedStorage(owner) {
  const files = await File.find({ owner, trashed: { $ne: true } });
  return files.reduce((s, f) => s + (f.size || 0), 0);
}

/** ===============================
 *  GET /trash  → list items in trash
 *  =============================== */
router.get('/trash', requireAuth, async (req, res) => {
  try {
    const owner = req.user.email;

    const trashedFolders = await Folder.find({
      owner,
      trashed: true
    }).lean();

    const trashedFiles = await File.find({
      owner,
      trashed: true
    }).lean();

    return res.json({
      folders: trashedFolders,
      files: trashedFiles
    });

  } catch (err) {
    console.error("List trash error:", err);
    return res.status(500).json({
      message: "Failed to list trash",
      error: err.message
    });
  }
});

/** ===============================
 *  POST /trash/restore
 *  =============================== */
router.post('/trash/restore', requireAuth, async (req, res) => {
  try {
    const owner = req.user.email;
    const { id } = req.body;

    if (!id) return res.status(400).json({ message: 'id is required' });
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid id' });

    /** -------------------------
     * RESTORE FILE
     * ------------------------- */
    const file = await File.findById(id);
    if (file) {
      if (String(file.owner) !== owner) return res.status(403).json({ message: 'Forbidden' });
      if (!file.trashed) return res.status(400).json({ message: 'File is not in trash' });

      // Check parent folder status
      if (file.folder) {
        const parent = await Folder.findById(file.folder);
        if (parent && parent.trashed === true) {
          return res.status(400).json({ message: 'Restore parent folder first' });
        }
      }

      file.trashed = false;
      file.trashedAt = null;
      file.trashedBy = null;
      await file.save();

      writeActivity(`RESTORE FILE id=${id}`, 'OK');

      return res.json({ message: 'File restored', id });
    }

    /** -------------------------
     * RESTORE FOLDER (recursive)
     * ------------------------- */
    const folder = await Folder.findById(id);
    if (!folder) return res.status(404).json({ message: 'Item not found' });
    if (String(folder.owner) !== owner) return res.status(403).json({ message: 'Forbidden' });
    if (!folder.trashed) return res.status(400).json({ message: 'Folder is not in trash' });

    // Validate parent
    if (folder.parent) {
      const parent = await Folder.findById(folder.parent);
      if (parent && parent.trashed) {
        return res.status(400).json({ message: 'Restore parent folder first' });
      }
    }

    const foldersToRestore = await gatherFolderTree(owner, id);

    await Folder.updateMany(
      { _id: { $in: foldersToRestore } },
      { $set: { trashed: false, trashedAt: null, trashedBy: null } }
    );

    await File.updateMany(
      { owner, folder: { $in: foldersToRestore } },
      { $set: { trashed: false, trashedAt: null, trashedBy: null } }
    );

    writeActivity(`RESTORE FOLDER id=${id}`, 'OK', `restoredFolders=${foldersToRestore.length}`);

    return res.json({ message: 'Folder restored recursively', restoredFolders: foldersToRestore.length });

  } catch (err) {
    console.error('Restore error:', err);
    return res.status(500).json({ message: 'Restore failed', error: err.message });
  }
});

/** ===============================
 *  POST /trash/empty → permanent delete
 *  =============================== */
router.post('/trash/empty', requireAuth, async (req, res) => {
  try {
    const owner = req.user.email;
    const { id } = req.body;

    /** -------------------------
     * Helper: XÓA VĨNH VIỄN nhiều folder + file trong đó
     * ------------------------- */
    const deleteFolderTree = async (folderIds) => {
      const files = await File.find({ owner, folder: { $in: folderIds }, trashed: true });

      // Lấy KEY chuẩn để delete S3
      const s3List = files
        .filter(f => f.s3Url)
        .map(f => {
          const raw = f.s3Url.split(".com/")[1].split("?")[0];
          return { Key: decodeURIComponent(raw) };
        });

      // XÓA S3 NẾU CÓ
      if (s3List.length > 0) {
        await s3.deleteObjects({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Delete: { Objects: s3List }
        }).promise();
      }

      // XÓA DB
      const deletedFiles = await File.deleteMany({
        owner,
        folder: { $in: folderIds },
        trashed: true
      });

      const deletedFolders = await Folder.deleteMany({
        _id: { $in: folderIds },
        trashed: true
      });

      return {
        deletedFiles: deletedFiles.deletedCount,
        deletedFolders: deletedFolders.deletedCount,
        bytesFreed: files.reduce((s, f) => s + (f.size || 0), 0)
      };
    };

    /** -------------------------
     * TRƯỜNG HỢP: XÓA 1 ITEM (FILE HOẶC FOLDER)
     * ------------------------- */
    if (id) {
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: 'Invalid id' });
      }

      /** ===== DELETE FILE ===== */
      const file = await File.findById(id);

      if (file) {
        if (String(file.owner) !== owner) return res.status(403).json({ message: 'Forbidden' });
        if (!file.trashed) return res.status(400).json({ message: 'File is not in trash' });

        // Lấy key chuẩn
        if (file.s3Url) {
          const rawKey = file.s3Url.split(".com/")[1].split("?")[0];
          const Key = decodeURIComponent(rawKey);

          await s3.deleteObject({
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key
          }).promise();
        }

        const bytesFreed = file.size || 0;
        await file.deleteOne();

        const newUsed = await calculateUsedStorage(owner);
        await User.updateOne({ email: owner }, { storageUsed: newUsed });

        writeActivity(`PERMANENT DELETE FILE id=${id}`, "OK", `bytesFreed=${bytesFreed}`);

        return res.json({
          message: "File permanently deleted",
          id,
          storageUsed: newUsed
        });
      }

      /** ===== DELETE FOLDER ===== */
      const folder = await Folder.findById(id);

      if (!folder) return res.status(404).json({ message: "Item not found" });
      if (String(folder.owner) !== owner) return res.status(403).json({ message: "Forbidden" });
      if (!folder.trashed) return res.status(400).json({ message: "Folder is not in trash" });

      const folderIds = await gatherFolderTree(owner, id);
      const result = await deleteFolderTree(folderIds);

      const newUsed = await calculateUsedStorage(owner);
      await User.updateOne({ email: owner }, { storageUsed: newUsed });

      writeActivity(`PERMANENT DELETE FOLDER id=${id}`, "OK");

      return res.json({
        message: "Folder permanently deleted",
        deletedFolders: result.deletedFolders,
        deletedFiles: result.deletedFiles,
        storageUsed: newUsed
      });
    }

    /** -------------------------
     * TRƯỜNG HỢP: EMPTY TOÀN BỘ THÙNG RÁC
     * ------------------------- */

    // Lấy toàn bộ folder rác
    const trashedFolders = await Folder.find({ owner, trashed: true }).lean();
    const folderIds = trashedFolders.map(f => f._id.toString());

    // Xóa tất cả file trong các folder rác
    const result = await deleteFolderTree(folderIds);

    // Xóa mọi file trashed còn sót lại (file orphan hoặc file root)
    const trashedFiles = await File.find({ owner, trashed: true });

    const s3KeysRoot = trashedFiles
      .filter(f => f.s3Url)
      .map(f => {
        const raw = f.s3Url.split(".com/")[1].split("?")[0];
        return { Key: decodeURIComponent(raw) };
      });

    if (s3KeysRoot.length > 0) {
      await s3.deleteObjects({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Delete: { Objects: s3KeysRoot }
      }).promise();
    }

    const rootDeleted = await File.deleteMany({ owner, trashed: true });

    const newUsed = await calculateUsedStorage(owner);
    await User.updateOne({ email: owner }, { storageUsed: newUsed });

    writeActivity("EMPTY TRASH", "OK");

    return res.json({
      message: "Trash emptied",
      deletedFolders: result.deletedFolders,
      deletedFiles: result.deletedFiles + rootDeleted.deletedCount,
      storageUsed: newUsed
    });

  } catch (err) {
    console.error("Empty trash error:", err);
    return res.status(500).json({ message: "Failed to empty trash", error: err.message });
  }
});


module.exports = router;

