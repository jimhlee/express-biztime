/**Check request body is not empty */
function checkBodyEmpty(req, res, next) {
  if (!req.body) throw new BadRequestError('Please enter valid input');
  next();
}



module.exports = {
  checkBodyEmpty
};