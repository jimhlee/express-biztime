const express = require("express");
const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db");

const router = new express.Router();

/** GET / => {companies: [{code, name, description}, ...]} */
router.get('/', async function (req, res) {
  const results = await db.query(
    `SELECT code, name, description
     FROM companies`);

  const companies = results.rows;

  return res.json({ companies });

});

/** GET / => {company: {code, name, description}, ...} */
router.get('/:code', async function (req, res) {
  if (!req.params.code) throw new NotFoundError();

  const result = await db.query(
    `SELECT code, name, description
     FROM companies
     WHERE code = $1`,
    [req.params.code]
  );
  const company = result.rows[0];
  console.log(result.rows);
  return res.json({ company });

});









module.exports = router;