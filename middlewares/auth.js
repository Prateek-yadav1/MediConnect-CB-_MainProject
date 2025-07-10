function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  res.redirect('/login');
}
function isDoctor(req, res, next) {
  if (req.user && req.user.role === 'doctor') return next();
  res.redirect('/login');
}

function isLoggedIn(req, res, next) {
    if (req.user) return next();
    res.redirect('/login');
}

module.exports = { isDoctor, isAdmin, isLoggedIn };