// NOT IN USE
function mongooseError(err) {
  res.status(500).json({
    error: err,
  });
}
module.exports = { mongooseError }
