const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

// Test static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

// Test route to list files
app.get('/test-files', (req, res) => {
  try {
    const uploadsPath = path.join(__dirname, 'uploads');
    const files = fs.readdirSync(uploadsPath);
    res.json({
      uploadsPath,
      fileCount: files.length,
      files: files.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Test image URLs:`);
  
  try {
    const uploadsPath = path.join(__dirname, 'uploads');
    const files = fs.readdirSync(uploadsPath);
    files.slice(0, 3).forEach(file => {
      console.log(`http://localhost:${PORT}/uploads/${file}`);
    });
  } catch (error) {
    console.error('Error reading uploads directory:', error);
  }
}); 