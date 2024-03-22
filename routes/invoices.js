"use strict";

const express = require("express");
const { NotFoundError, BadRequestError, DuplicateError } = require("../expressError");
const db = require("../db");
const { checkBodyEmpty } = require("./middleware");
const router = new express.Router();


/** GET / Gets all invoices
 * / =>  {invoices: [{id, comp_code}, ...]} */
router.get('/', async function (req, res) {
  const results = await db.query(
    `SELECT id, comp_code
     FROM invoices`);

  const invoices = results.rows;

  return res.json({ invoices });
});

/** GET / Gets a specific invoice
 * / invoice.id =>  {invoice: {id, amt, paid, add_date, paid_date,
 * company: {code, name, description}} */

router.get('/:id', async function (req, res) {
  // const invoiceResult = await db.query(
  //   `SELECT id, comp_code, amt, paid, add_date, paid_date
  //    FROM invoices
  //    WHERE id = $1`,
  //   [req.params.id]);

  // const invoice = invoiceResult.rows[0];
  // if (!invoice) throw new NotFoundError('Invoice not found');
  // const comp_code = invoice.comp_code;
  // delete invoice.comp_code;

  // const companyResult = await db.query(
  //   `SELECT code, name, description
  //    FROM companies
  //    WHERE code = $1`,
  //   [comp_code]
  // );
  const result = await db.query(
    `SELECT i.id, i.amt, i.paid, i.add_date, i.paid_date, c.code, c.name, c.description
    FROM invoices as i
    JOIN companies as c ON c.code = i.comp_code
    WHERE i.id = $1`,
    [req.params.id]
  );
  const invoice = result.rows[0];
  const { id, amt, paid, add_date, paid_date, code, name, description } = invoice;


  if (!invoice) throw new NotFoundError('Invoice not found');

  return res.json({ 'invoice': { id, amt, paid, add_date, paid_date }, 'company': { code, name, description } });
});

/** POST / Adds an invoice
 *  Receives JSON: {comp_code, amt}
 * => Returns {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */
router.post('/',
  checkBodyEmpty,
  async function (req, res) {
    const { comp_code, amt } = req.body;

    if (!amt) throw new BadRequestError('Not a valid amount');

    const companyResult = await db.query(
      `SELECT code
       FROM companies
       WHERE code = $1`,
      [comp_code]
    );
    const company = companyResult.rows[0];
    if (!company) throw new NotFoundError('Company code not found');

    const result = await db.query(
      `INSERT INTO invoices (comp_code, amt)
       VALUES ($1, $2 )
       RETURNING comp_code, amt, paid, add_date, paid_date`,
      [comp_code, amt]
    );

    const invoice = result.rows[0];

    return res.status(201).json({ invoice });

  });


/** PUT / Updates Invoice
 *  Receives {amt}
 * => Returns {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */
router.put('/:id',
  checkBodyEmpty,
  async function (req, res) {
    const { amt } = req.body;

    if (!amt) throw new BadRequestError('Not a valid amount');

    const updatedAmt = await db.query(
      `UPDATE invoices
      SET amt = $1
      WHERE id = $2
      RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [amt, req.params.id]
    );

    const invoice = updatedAmt.rows[0];
    if (!invoice) throw new NotFoundError('Invoice not found');

    return res.json({ invoice });
  });


/** DELETE / Deletes Invoice
 * Receives {id}
 * Returns {status: "deleted"} or 404
 */
router.delete('/:id', async function (req, res) {
  const result = await db.query(
    `DELETE FROM invoices
    WHERE id = $1
    RETURNING id`,
    [req.params.id]
  );
  const deletedInvoice = result.rows[0];
  if (!deletedInvoice) throw new NotFoundError('Invoice not found');

  return res.json({ status: 'deleted' });
});



module.exports = router;