require("dotenv").config();
const express = require("express"); 
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
const router = express.Router();
router.post("/download", async (req, res) => {
  try {
    const { key } = req.body;

    const url = await s3.getSignedUrlPromise("getObject", {
      Bucket: "data-cloud-server",
      Key: key,
      Expires: 120,
      ResponseContentDisposition: "attachment"
    });

    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: "Error generating URL" });
  }
});
module.exports = router;
