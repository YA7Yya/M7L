exports.isEmployee = (req, res, next) => {
  if (req.session.role === "Employee" || req.session.role === "Manager" || req.session.role === "Developer") next();
  else{
    res.redirect("/login")
  }
};
exports.notEmployee = (req, res, next) => {
  if (!req.session.isEmployee) next();
  else res.redirect("/");
};
