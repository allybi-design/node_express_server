exports.get500 = (req, res, next) => {
  res.status(500).render("errors/500", {
    docTitle: "Error 500",
    path: "/500",
    errorMsg: "OOOPPPSSS!!!",
    isAuth: req.session.isLoggedIn
  });
};

exports.get404 = (req, res, next) => {
  res.status(500).render("errors/404", {
    docTitle: "Error 404",
    path: "",
    errorMsg: "",
    isAuth: req.session.isLoggedIn
  });
};
