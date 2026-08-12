console.log("### NEW building model loaded ###");

const db = require("../config/db");

async function findAll() {
  const [rows] = await db.query(`
    SELECT
      M.BUILD_ID,
      M.BUILD_NM,
      M.CHK_COMPANY_NM,
      M.STATE_CD,
      M.STATE_NM,
      M.REQ_SIZE_CD,
      M.REQ_SIZE_NM,
      M.SAFE_CHK_YN,
      M.CHK_YN,
      M.CHK_COM_CD,
      M.LAT,
      M.LNG,
      M.ADDRESS,
      H.CHK_DATE

    FROM MOLIT_MAP_INFO M

    LEFT JOIN MOLIT_HISTORY H
      ON M.BUILD_ID = H.MOL_HIS_ID

    ORDER BY M.BUILD_ID
  `);

  return rows;
}

module.exports = {
  findAll,
};