exports.get500 = (req, res, next) => {
  res.status(500).render("errors/500", {
    docTitle: "Error 500",
    path: "",
    error: "ERROR: 500"
  });
};

exports.get404 = (req, res, next) => {
  res.status(500).render("errors/404", {
    docTitle: "Error 404",
    path: "",
    error: "ERROR: 404"
  });
};
