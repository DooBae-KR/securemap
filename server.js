require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static("public"));

app.use("/api/buildings", require("./routes/building"));

app.listen(3000, () => {

    console.log("Server Start");
    console.log("http://localhost:3000");

});