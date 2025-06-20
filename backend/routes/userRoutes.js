const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.delete("/", authMiddleware, userController.deleteAccount)
router.get("/", authMiddleware, userController.listProfile)
router.post("/profile-picture", authMiddleware, upload.single('image'), userController.changeProfilePicture)

router.get("/protected", authMiddleware, (req, res) => {
    let clientIP = req.ip || req.connection.remoteAddress;
    if (clientIP === '::1') {
        clientIP = '127.0.0.1';
    }
    const agent = req.get('User-Agent')
    const host = req.get('Host')
    const ContentType = req.get('Content-Type')
    res.status(200).json({
        message: 'Você está autenticado:',
        clientIP: clientIP,
        userAgent: agent,
        host: host,
        ContentType: ContentType,
    });
});

module.exports = router
