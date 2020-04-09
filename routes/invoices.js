const express = require("express");
const router = new express.Router();
const db = require("../db")
const ExpressError = require("../expressError")

const NOT_FOUND = 404;
const BAD_REQUEST = 400;

/**
 * GET /invoices
 * Return info on invoices: like {invoices: [{id, comp_code}, ...]
 */

router.get("/", async function (req, res, next) {
  try {
    const results = await db.query(
      `SELECT id, comp_code
       FROM invoices`);

    if (results.rows.length === 0) {
      return res.json({ "message": "No invoices found" });
    }

    return res.json({ "invoices": results.rows });
  }
  catch (err) {
    return next(err);
  }
})


/**
 * Returns obj on given invoice.
 * 
 * If invoice cannot be found, returns 404.
 * 
 * Returns {invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}
 */

router.get('/:id', async function (req, res, next) {
  try {
    const id = req.params.id;

    const results = await db.query(
      `SELECT id, amt, paid, add_date, paid_date, c.code, c.name, c.description
       FROM invoices
       JOIN companies AS c
       ON comp_code = c.code
       WHERE id=$1`, [id]);

    if (results.rows.length === 0) {
      throw new ExpressError("Invoice not found", 
                             NOT_FOUND)
    }

    console.log("THE RESULTS ARRAY LOOKS LIKE THIS", results.rows)
    debugger

    let { amt, paid, add_date, paid_date } = results.rows[0];
    let { code, name, description } = results.rows[0];

    return res.json({
      invoice: {
        amt, paid, add_date, paid_date,
      company: { code, name, description }
      }
    });
  }
  catch (err) {
    return next(err)
  }
})

/**
 * Adds an invoice.
 * 
 * Needs to be passed in JSON body of: {comp_code, amt}
 * 
 * Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */

router.post('/', async function (req, res, next) {
  try {
    const { comp_code, amt } = req.body;

    const results = await db.query(
      `INSERT INTO invoices 
       (comp_code, amt)
       VALUES ($1, $2)
       RETURNING id, amt, paid, add_date, paid_date
       `, [comp_code, amt]);

    if (results.rows.length === 0) {
      throw new ExpressError("Bad request", 
                             BAD_REQUEST);
    }
    return res.json({invoice: results.rows[0] });
  }
  catch (err) {
    return next(err);
  }
})


/**
 * Updates an invoice.
 * 
 * If invoice cannot be found, returns a 404.
 * 
 * Needs to be passed in a JSON body of {amt}
 * 
 * Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */

router.put('/:id', async function (req, res, next) {
  try {
    const id = req.params.id;
    const amt = req.body.amt;

    const results = await db.query(`
      UPDATE invoices
      SET amt = $2
      WHERE id = $1
      RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [id, amt]);

    if (results.rows.length === 0) {
      throw new ExpressError("Invoice not found", 
                             NOT_FOUND)
    }
    return res.json({invoice: results.rows[0] })
  }
  catch (err) {
    return next(err)
  }
})

/**
 * Deletes an invoice.
 * 
 * If invoice cannot be found, returns a 404.
 * 
 * Returns: {status: "deleted"}
 */

router.delete('/:id', async function (req, res, next) {
  try {
    const id = req.params.id;

    const results = await db.query(`
      DELETE FROM invoices
      WHERE id = $1
      RETURNING id`,
      [id]);

    if (results.rows.length === 0) {
      throw new ExpressError("Invoice not found",
                             NOT_FOUND)
    }
    return res.json({status: "deleted"})
  }
  catch(err) {
    return next(err)
  }
})


module.exports = router;