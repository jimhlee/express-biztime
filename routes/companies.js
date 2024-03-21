"use strict";

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

  const result = await db.query(
    `SELECT code, name, description
    FROM companies
    WHERE code = $1`,
    [req.params.code]
  );
  const company = result.rows[0];

  if (!company) throw new NotFoundError();

  return res.json({ company });

});

/** POST / => Receives {code, name, description}
 * Returns {company: {code, name, description}}
 */
router.post('/', async function (req, res) {
  if (!req.body) throw new BadRequestError();

  if (!req.body.name || !req.body.description) throw new BadRequestError();
  if (Object.keys(req.body).length === 0) throw new BadRequestError();

  const { code, name, description } = req.body;
  const result = await db.query(
    `INSERT INTO companies
    (code, name, description)
    VALUES ($1, $2, $3)
    RETURNING code, name, description`,
    [code, name, description],
  );
  const newCompany = result.rows[0];
  return res.status(201).json({ newCompany });
});

/** PUT / => Receives {name, description}
 * Returns {company: {code, name, description}} or 404
 */
router.put('/:code', async function (req, res) {

  if (!Object.keys(req.body).length) throw new BadRequestError();
  if (!req.name || !req.description) throw new BadRequestError();

  const { name, description } = req.body;

  const result = await db.query(
    `UPDATE companies
    SET name = $1,
    description = $2
    WHERE code = $3
    RETURNING code, name, description`,
    [name, description, req.params.code]
  );

  const updatedCompany = result.rows[0];

  if (!updatedCompany) throw new NotFoundError();

  return res.json({ updatedCompany });

});

/** DELETE / => Delete company
 * Returns {status: "deleted"} or 404
 */
router.delete('/:code', async function (req, res) {
  const result = await db.query(
    `DELETE
     FROM companies
     WHERE code = $1
     RETURNING name`,
    [req.params.code]
  );
  const deletedRow = result.rows[0];

  if (!deletedRow) throw new NotFoundError(`Not found: ${req.params.code}`);

  return res.json({ status: "Deleted" });
});




module.exports = router;