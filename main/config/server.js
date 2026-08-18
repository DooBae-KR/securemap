require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/buildings", require("../routes/building"));
app.use("/api/charts", require("../routes/chart"));

app.listen(3001, () => {

    console.log("Server Start");
    console.log("http://localhost:3001");

});