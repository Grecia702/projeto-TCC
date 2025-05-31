const express = require("express");
const router = express.Router();
const goalsController = require("../Controller/goalsController");
const authMiddleware = require('../middleware/authMiddleware');

router.post("/", authMiddleware, goalsController.createGoal)
router.get("/list", authMiddleware, goalsController.getGoals)
router.get("/:id", authMiddleware, goalsController.getGoalById)
router.patch("/saldo/:id", authMiddleware, goalsController.updateSaldo)
router.patch("/:id", authMiddleware, goalsController.updateGoal)
router.delete("/:id", authMiddleware, goalsController.deleteGoal)


module.exports = router
