// routes/upload.js
const express = require('express');
const router = express.Router();
const multer = require('multer');

// Set up the multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Specify the folder where the images will be stored on the server
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        // Generate a unique filename for the uploaded image
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

// Set up the multer upload instance
const upload = multer({ storage });

// Handle image upload
router.post('/image', upload.single('image'), (req, res) => {
    // Return the path to the uploaded image on the server
    res.json({ data: `/uploads/${req.file.filename}` });
});

module.exports = router;
