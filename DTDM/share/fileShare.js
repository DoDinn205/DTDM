const express = require("express");
const jwt = require("jsonwebtoken");
const File = require("../models/fileModel");
const Folder = require("../models/folderModel");
const { requireAuth } = require("../middleware/auth");
const { writeActivity } = require("../log");

const router = express.Router();


// Helper to decode token if present (optional auth)
function tryDecodeToken(req) {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return null;
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { email: decoded.email, role: decoded.role };
  } catch (e) {
    return null;
  }
}

// GET /share/file/:fileId - return s3Url if public or shared with caller
router.post('/file/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const file = await File.findById(id);
    if (!file) return res.status(404).json({ message: 'File not found' });
    if (file.trashed) return res.status(404).json({ message: 'File not found' });

    const requester = tryDecodeToken(req);
    const isOwner = requester && requester.email === file.owner;
    const isAdmin = requester && requester.role === 'admin';

    if (file.visibility === 'public') {
      try { writeActivity(`ACCESS FILE id=${id}`, 'OK', 'public'); } catch(_){}
      return res.json({ filename: file.filename, s3Url: file.s3Url, mimetype: file.mimetype, size: file.size });
    }

    if (file.visibility === 'shared') {
      if (!requester) return res.status(401).json({ message: 'Authentication required for shared file' });
      const allowed = isOwner || isAdmin || (Array.isArray(file.sharedWith) && file.sharedWith.some(s => s.userId === requester.email));
      if (!allowed) return res.status(403).json({ message: 'Forbidden' });
      try { writeActivity(`ACCESS FILE id=${id}`, 'OK', 'shared'); } catch(_){}
      return res.json({ filename: file.filename, s3Url: file.s3Url, mimetype: file.mimetype, size: file.size });
    }

    return res.status(403).json({ message: 'File is private' });
  } catch (err) {
    console.error('Public file view error:', err);
    return res.status(500).json({ message: 'Failed to fetch file', error: err.message });
  }
});

router.get("/folder/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const folder = await Folder.findById(id);
    if (!folder || folder.trashed)
      return res.status(404).json({ message: "Folder not found" });

    const user = tryDecode(req);
    const isOwner = user && user.email === folder.owner;

    // Quyền xem
    if (folder.visibility === "private")
      return res.status(403).json({ message: "Folder is private" });

    if (folder.visibility === "shared" && !isOwner) {
      if (!user) return res.status(401).json({ message: "Login required" });

      const allowed = folder.sharedWith?.some(s => s.email === user.email);
      if (!allowed) return res.status(403).json({ message: "Forbidden" });
    }

    // Lấy subfolder và file CHỈ 1 CẤP
    const subFolders = await Folder.find({
      parent: id,
      trashed: { $ne: true }
    }).select("_id name visibility");

    const files = await File.find({
      folder: id,
      trashed: { $ne: true }
    }).select("_id filename mimetype size s3Url visibility");

    return res.json({
      folder: {
        id: folder._id,
        name: folder.name,
        parent: folder.parent,
        visibility: folder.visibility
      },
      subFolders,
      files
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load folder" });
  }
});


module.exports = router;
