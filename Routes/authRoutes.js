const express = require("express");
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const verifyRefresh = require('../middleware/verifyRefreshToken');
const authController = require('../controller/authController')
const logger = require('../utils/loggerConfig')

router.post("/login", authController.login);
router.post("/signup", authController.signup);
router.post('/logout', verifyRefresh, authController.logout);
router.post('/refresh', verifyRefresh, authController.refresh);
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
