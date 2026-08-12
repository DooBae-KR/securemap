const Building = require("../models/building");

async function getBuildings(queryObject) {
  if (queryObject && queryObject.statement) {
    return Building.executeQuery(queryObject);
  }

  return Building.findAll();
}

async function runQuery(queryObject) {
  if (!queryObject || typeof queryObject.statement !== "string") {
    throw new Error("queryObject must include a SQL statement string.");
  }

  return Building.executeQuery(queryObject);
}

module.exports = {
  getBuildings,
  runQuery
};