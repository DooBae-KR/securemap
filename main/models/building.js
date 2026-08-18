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
/**********
 안전진단여부별 건축물 수 (차트표시)
 *********/
async function lChartCount() {
  const [rows] = await db.query(`
  SELECT COUNT(*) AS CNT
        , MOL.SAFE_CHK_YN 
        , COM.CD_NM
        , COM.SHORT_NM
	  FROM MOLIT_MAP_INFO MOL
	  LEFT OUTER JOIN COM_CD_TB COM
	    ON MOL.SAFE_CHK_YN = COM.CD
   GROUP BY MOL.SAFE_CHK_YN, COM.CD_NM , COM.SHORT_NM
UNION ALL
SELECT 	
      COUNT(*) AS CNT
      , 'A' AS SAFE_CHK_YN
      , 'SUM' AS CD_NM
      , '합계' AS SHORT_NM
  FROM MOLIT_MAP_INFO MOL
 GROUP BY MOL.SAFE_CHK_YN ,CD_NM, SHORT_NM
  `);
  
  return rows;
}
/**********
 안전진단여부별 건축물 수 (차트표시)
 *********/
async function rChartCount() {
  const [rows] = await db.query(`
  SELECT COUNT(*) AS CNT
        , MOL.CHK_YN 
        , COM.CD_NM
        , COM.SHORT_NM
	  FROM MOLIT_MAP_INFO MOL
	  LEFT OUTER JOIN COM_CD_TB COM
	    ON MOL.CHK_YN = COM.CD
   GROUP BY MOL.CHK_YN, COM.CD_NM , COM.SHORT_NM
UNION ALL
SELECT 	
      COUNT(*) AS CNT
      , 'A' AS CHK_YN
      , 'SUM' AS CD_NM
      , '합계' AS SHORT_NM
  FROM MOLIT_MAP_INFO MOL
 GROUP BY CHK_YN ,CD_NM, SHORT_NM
  `);
  
  return rows;
}

module.exports = {
  findAll,
  lChartCount,
  rChartCount
};