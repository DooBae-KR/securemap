const express = require("express");
const router = express.Router();

const chartController = require("../controllers/chartController");

// GET /api/charts
router.get("/statis/left", chartController.getLeftChartData);
router.get("/statis/right", chartController.getRightChartData);
router.get("/statis/agency", chartController.getBarChartData);

module.exports = router;