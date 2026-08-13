console.log("### NEW chart model loaded ###");

const db = require("../config/db");
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
 점검진단여부별 건축물 수 (차트표시)
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
  lChartCount,
  rChartCount
};