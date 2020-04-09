const express = require("express");
const router = new express.Router();
const db = require("../db")
const ExpressError = require("../expressError")

router.get("/", async function(req, res, next) {
  try {

    const result = await db.query(
      `SELECT code, name
       FROM companies`);

    return res.json({companies: result.rows});
  }

  catch(err) {
    return next(err);
  }
});


module.exports = router;