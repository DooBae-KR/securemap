const express = require("express");
const router = express.Router();

const buildingController = require("../controllers/chartController");

// GET /api/charts
router.get("/statis/left", chartController.getLeftChartData);  
router.get("/statis/right", chartController.getRightChartData);

module.exports = router;