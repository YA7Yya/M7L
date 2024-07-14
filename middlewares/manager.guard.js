exports.isManager = (req, res, next) => {
  if (req.session.role === "Manager"|| req.session.role === "Developer") next();
  else res.redirect("/not-manager");
};
exports.notManager = (req, res, next) => {
  if (!req.session.role === "Manager") next();
  else res.redirect("/");
};
