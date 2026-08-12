const Building = require("../models/building");

async function getBuildings(req, res) {
    try {
        const buildings = await Building.findAll();
        res.status(200).json(buildings);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "건물 목록을 불러오지 못했습니다."
        });
    }
}

module.exports = {
    getBuildings
};