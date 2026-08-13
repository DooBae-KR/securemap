const chart = require("../models/chart");

async function getLeftChartData(req, res) {
    try {
        const lChartData = await chart.lChartCount();
        res.status(200).json(lChartData);
            } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "차트 데이터를 불러오지 못했습니다."
        });
    }
}
async function getRightChartData(req, res) {
    try {
        const rChartData = await chart.rChartCount();
        res.status(200).json(rChartData);
            } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "차트 데이터를 불러오지 못했습니다."
        });
    }
}

module.exports = {
    getLeftChartData,
    getRightChartData
};
};