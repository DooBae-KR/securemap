const express = require("express");
const router = express.Router();

const db = require("../db");

// 건물 목록 조회
router.get("/", async (req, res) => {

    try {

        const [rows] = await db.query(
            "SELECT * FROM building ORDER BY id"
        );

        res.json(rows);

    } catch (err) {

        console.error(err);
        res.status(500).json({
            message: "DB Error"
        });

    }

});

module.exports = router;