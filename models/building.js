const db = require("../db");

async function findAll() {
    const [rows] = await db.query(
        "SELECT LAT, LNG, ADDRESS, BUILD_NM, BUILD_ID FROM MOLIT_MAP_INFO ORDER BY BUILD_ID"
    );

    return rows;
}

module.exports = {
    findAll
};