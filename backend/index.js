// server/index.js
require('dotenv').config();
const express = require('express');
const fileUpload = require('express-fileupload');
const mysql = require('mysql2/promise');
const axios = require('axios');
const cors = require('cors')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const allowedOrigin = process.env.FRONTEND_URL 

const app = express();
app.use(express.json());
app.use(fileUpload());
app.use(cors({
  origin: allowedOrigin
}))

const db = mysql.createPool({
  host: process.env.MYSQL_HOST,  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB
});

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
})
const INFERENCE_URL = process.env.INFERENCE_URL;
const S3_BUCKET = process.env.S3_BUCKET;

app.post('/api/upload', async (req, res) => {
  const regionName = req.body.region || null;
  const file = req.files?.image;
  if (!file) return res.status(400).json({ error: 'No file' });

  const s3Key = `uploads/${Date.now()}_${file.name}`;
  await s3.send(new PutObjectCommand({
    Bucket: S3_BUCKET, Key: s3Key, Body: file.data, ContentType: file.mimetype
  }));

  let regionId = null;
  if (regionName) {
    const [rows] = await db.query('SELECT id FROM regions WHERE name=?', [regionName]);
    if (rows.length) regionId = rows[0].id;
  }
  const [result] = await db.query('INSERT INTO images (s3_key, region_id) VALUES (?, ?)', [s3Key, regionId]);
  const imageId = result.insertId;

  const inferResp = await axios.post(`${INFERENCE_URL}/infer`, { s3_key: s3Key });
  const detections = inferResp.data.detections || [];

  for (const d of detections) {
    await db.query(
      `INSERT INTO detections (image_id, class_label, confidence, bbox_x, bbox_y, bbox_w, bbox_h)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [imageId, d.class_label, d.confidence, d.bbox_x, d.bbox_y, d.bbox_w, d.bbox_h]
    );
  }

  res.json({ imageId, count: detections.length });
});

app.get('/api/summary', async (req, res) => {
  const [byRegion] = await db.query(`
        SELECT r.name AS region,
            r.ordered,
            SUM(CASE WHEN d.class_label='trees' THEN 1 ELSE 0 END) AS planted
        FROM regions r
        LEFT JOIN images i ON i.region_id = r.id
        LEFT JOIN detections d ON d.image_id = i.id
        GROUP BY r.id
        ORDER BY r.name;
  `);

  const [totals] = await db.query(`
    SELECT 
        (SELECT SUM(ordered) FROM regions) AS total_ordered,
        (SELECT SUM(CASE WHEN class_label='trees' THEN 1 ELSE 0 END) FROM detections) AS total_planted;
  `);

  const [metrics] = await db.query(`
    SELECT * FROM metrics ORDER BY metric_date DESC LIMIT 1
  `);

  const cleanTotals = {
    ordered: Number(totals[0].total_ordered) || 0,
    planted: Number(totals[0].total_planted) || 0
  };

  res.json({
    byRegion,
    totals: cleanTotals,
    metrics: metrics[0] || null
  });
});

app.listen(3000, () => console.log('API running on :3000'));
