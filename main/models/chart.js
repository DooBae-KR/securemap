console.log("### NEW chart model loaded ###");

const db = require("../config/db");
/**********
 안전진단여부별 건축물 수 (차트표시)
 *********/
async function lChartCount() {
  const [rows] = await db.query(`
 SELECT (SELECT CD_NM FROM COM_CD_TB WHERE CD ='T1' LIMIT 1) AS TITLE 
	, COUNT(*) AS CNT
	, MOL.SAFE_CHK_YN 
	, COM.CD_NM
	, COM.SHORT_NM
	FROM MOLIT_MAP_INFO MOL
	LEFT OUTER JOIN COM_CD_TB COM	
	ON MOL.SAFE_CHK_YN = COM.CD
	GROUP BY MOL.SAFE_CHK_YN, COM.CD_NM , COM.SHORT_NM
UNION ALL
SELECT 	(SELECT CD_NM FROM COM_CD_TB WHERE CD ='T1' LIMIT 1) AS TITLE 
	, COUNT(*) AS CNT
 	, 'SUM' AS SAFE_CHK_YN
 	, '합계' AS CD_NM
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
  SELECT (SELECT CD_NM FROM COM_CD_TB WHERE CD ='T2' LIMIT 1) AS TITLE 
	    , COUNT(*) AS CNT
        , MOL.CHK_YN 
        , COM.CD_NM
        , COM.SHORT_NM
	  FROM MOLIT_MAP_INFO MOL
	  LEFT OUTER JOIN COM_CD_TB COM
	    ON MOL.CHK_YN = COM.CD
   GROUP BY MOL.CHK_YN, COM.CD_NM , COM.SHORT_NM
UNION ALL
SELECT 	(SELECT CD_NM FROM COM_CD_TB WHERE CD ='T2' LIMIT 1) AS TITLE 
      ,COUNT(*) AS CNT
      , 'A' AS CHK_YN
      , 'SUM' AS CD_NM
      , '합계' AS SHORT_NM
  FROM MOLIT_MAP_INFO MOL
 GROUP BY CHK_YN ,CD_NM, SHORT_NM
  `);
  
  return rows;
}

/**********
 검사업체별 수 (막대차트표시)
 *********/
async function barChartCount() {
  const [rows] = await db.query(`
    SELECT (SELECT CD_NM FROM COM_CD_TB WHERE CD ='T3' LIMIT 1) AS TITLE 
	, COUNT(*) AS CNT
        , MOL.CHK_COM_CD 
        , COM.CD_NM
        , COM.SHORT_NM
	  FROM MOLIT_MAP_INFO MOL
	  LEFT OUTER JOIN COM_CD_TB COM
	    ON MOL.CHK_COM_CD = COM.CD
	   AND 'CHK_COM_CD' = COM.CD_KIND
   GROUP BY MOL.CHK_COM_CD, COM.CD_NM , COM.SHORT_NM
UNION ALL
SELECT 	(SELECT CD_NM FROM COM_CD_TB WHERE CD ='T3' LIMIT 1) AS TITLE 
      , COUNT(*) AS CNT
      , 'A' AS CHK_COM_CD
      , 'SUM' AS CD_NM
      , '합계' AS SHORT_NM
  FROM MOLIT_MAP_INFO MOL
  LEFT OUTER JOIN COM_CD_TB COM
	    ON MOL.CHK_COM_CD = COM.CD
  WHERE 'CHK_COM_CD' = COM.CD_KIND
 GROUP BY CHK_COM_CD ,CD_NM, SHORT_NM
  `);
  
  return rows;
}



module.exports = {
  lChartCount,
  rChartCount,  
  barChartCount,
};