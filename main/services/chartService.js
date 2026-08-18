const Chart = require("../models/chart");

async function lChartCount(queryObject) {
  if (queryObject && queryObject.statement) {
    return Chart.executeQuery(queryObject);
  }

  return Chart.lChartCount();
}

async function rChartCount(queryObject) {
  if (queryObject && queryObject.statement) {
    return Chart.executeQuery(queryObject);
  }

  return Chart.rChartCount();
}

async function agencyCompanyCount() {
  return Chart.agencyCompanyCount();
}


module.exports = {
  lChartCount,
  rChartCount,
  agencyCompanyCount
};