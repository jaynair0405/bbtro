const multer = require("multer");

// File upload middleware
const upload = multer({ dest: "uploads/" });

module.exports = upload;