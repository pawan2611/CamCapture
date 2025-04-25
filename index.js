const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS for frontend
app.use(cors());

// Serve static images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Upload endpoint
app.post('/upload-endpoint', upload.any(), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send('No images uploaded.');
  }
  console.log(`📥 Received ${req.files.length} images.`);
  res.status(200).send('Images received successfully.');
});

// Admin view to browse uploaded images
app.get('/admin', (req, res) => {
  const uploadDir = path.join(__dirname, 'uploads');
  fs.readdir(uploadDir, (err, files) => {
    if (err) return res.status(500).send('Unable to read upload directory');

    const imageTags = files.map(filename => {
      const imgPath = `/uploads/${filename}`;
      return `<div style="margin:10px;"><img src="${imgPath}" style="width:200px;"><p>${filename}</p></div>`;
    }).join('');

    res.send(`
      <html>
        <head><title>Admin - Uploaded Images</title></head>
        <body style="font-family: sans-serif;">
          <h1>📂 Uploaded Images</h1>
          <div style="display:flex; flex-wrap: wrap;">${imageTags}</div>
        </body>
      </html>
    `);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
