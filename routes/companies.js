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


router.post('/', async function (req, res) {
  if (!req.body) throw new BadRequestError();

  const { code, name, description } = req.body;
  const result = await db.query(
    `INSERT INTO companies
    (name, description)
    VALUES ($1, $2, $3)
    RETURNING code, name, description`,
    [code, name, description],
  );
  const newCompany = result.rows[0];
  return res.status(201).json({ newCompany });
});

router.put('/:code', async function (req, res) {
  if (!req.params.code) throw new NotFoundError();
  const { name, description } = req.body;

  const result = await db.query(
    `UPDATE companies
    SET name = $1,
    description = $2
    WHERE code = $3
    RETURNING code, name, description`,
    [name, description, req.params.code]
    );
    const updatedCompany = result.rows[0]
    return res.json({ newCompany });

});





module.exports = router;