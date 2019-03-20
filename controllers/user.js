const UserModel = require("../models/user")

//GET -  useer Log In
exports.getUserLogIn = (req, res, next) => {
	res.status(200).render("user/login", {
		docTitle: "User Log In",
		path: "/user/log-in"
	})
}
//POST  - user Log In
exports.postUserLogIn = (req, res, next) => {
	console.log(req.body)
	res.redirect(200, "/products")
}
//GET - user Log Out
exports.getUserLogOut = (req, res, next) => {
	res.status(200).render("shop/index", {
		docTitle: "Home",
		path: "/"
	})
}
//GET  - user Register
exports.getUserRegister = (req, res, next) => {
	res.status(200).render("user/register", {
		docTitle: "Register User",
		path: "/user/register"
	})
}
//POST - user Register
exports.postUserRegister = (req, res, next) => {
	const newUser = new UserModel(req.body.name, req.body.email, req.body.pw)
	newUser
		.save()
		.then(() => {
			res.status(200).redirect("/user/log-in")
		})
		.catch(err => console.log(err))
}
