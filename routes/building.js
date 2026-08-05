const express = require("express");
const router = express.Router();

const buildingController = require("../controllers/buildingController");

// GET /api/buildings
router.get("/", buildingController.getBuildings);

module.exports = router;