/** BizTime express application. */

const express = require("express");
const { NotFoundError } = require("./expressError");

const companiesRoutes = require('./routes/companies');
// const invoicesRoutes = require('./routes/invoices');

const app = express();

// Does this line parse json?
app.use(express.json());

app.use('/companies', companiesRoutes);
// app.use('/invoices', invoicesRoutes);


/** 404 handler: matches unmatched routes; raises NotFoundError. */
app.use(function (req, res, next) {
  throw new NotFoundError();
});

/** Error handler: logs stacktrace and returns JSON error message. */
app.use(function (err, req, res, next) {
  const status = err.status || 500;
  const message = err.message;
  if (process.env.NODE_ENV !== "test") console.error(status, err.stack);
  return res.status(status).json({ error: { message, status } });
});


module.exports = app;
