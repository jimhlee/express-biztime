"use strict";

const express = require("express");
const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db");

const router = new express.Router();

// invoices (comp_code, amt, paid, paid_date)
/** GET / Gets all invoices
 * / =>  {invoices: [{id, comp_code}, ...]} */
router.get('/', async function (req, res) {
  const results = await db.query(
    `SELECT id, comp_code
     FROM invoices`);

  const invoices = results.rows;

  return res.json({ invoices });
});

/** GET / Gets a specific invoices
 * / invoice.id =>  {invoice: {id, amt, paid, add_date, paid_date,
 * company: {code, name, description}} */
router.get('/:id', async function (req, res) {
  const invoiceResult = await db.query(
    `SELECT id, comp_code, amt, paid, add_date, paid_date
     FROM invoices
     WHERE id = $1`,
    [req.params.id]);

    const invoice = invoiceResult.rows[0];
    if (!invoice) throw new NotFoundError('Invoice not found');
    const comp_code = invoice.comp_code;
    delete invoice.comp_code;

  const companyResult = await db.query(
    `SELECT code, name, description
     FROM companies
     WHERE code = $1`,
    [comp_code]
  );

  const company = companyResult.rows[0];
  // if (!company) throw new NotFoundError('Comapny not found);

  return res.json({ 'invoice': invoice, 'company': company });
});


module.exports = router;