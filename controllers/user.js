var User = require('../models/user.js');

// signup
exports.signup = function(req, res){
	var _user = req.body;

	if(_user.name == ''){
		return res.json({status: 0, msg: '用户名不能为空'});
	}
	if(_user.password == ''){
		return res.json({status: 0, msg: '密码不能为空'});
	}

	User.findOne({name: _user.name}, function(err, user){
		if(err){
			console.log(err);
		}

		if(user){
			res.json({status: 0, msg: '该用户已存在'});
		}
		else{
			user = new User(_user);
			user.save(function(err, user){
				if(err){
					console.log(err);
				}
				req.session.user = user;
				res.json({status: 1, msg: 'success'});
			});
		}
	});
}

//signin
exports.signin = function(req, res){
	var _user = req.body;
	var name = _user.name;
	var password = _user.password;

	User.findOne({name: name}, function(err, user){
		if (err) {
			console.log(err);
		}

		if(!user){
			return res.json({status: 0, msg: '用户不存在'});
		}

		user.comparePassword(password, function(err, isMatch){
			if(err){
				console.log(err);
			}

			if(isMatch){
				req.session.user = user;
				return res.json({status: 1, msg: 'success'});
			}
			else{
				return res.json({status: 0, msg: '密码不正确'});
			}
		});
	});
};

//signout
exports.signout = function(req, res){
	delete req.session.user;
	return res.redirect('/admin/signin');
};

//showSignin
exports.showSignin = function(req, res){
	res.render('admin/signin', {
		title: '登录'
	});
};

//showSignout
exports.showSignup = function(req, res){
	res.render('admin/signup', {
		title: '注册'
	});
};

// userlist page
exports.list = function (req, res) {
	User.fetch(function(err, users){
		if (err) {
			console.log(err);
		}
		res.render('admin/user-list', {
			title: '用户列表',
			users: users
		});
	});
};

// midware for user
exports.signinRequired = function(req, res, next){
	var user = req.session.user;

	if(!user){
		return res.redirect('/admin/signin');
	}
	next();
};

exports.adminRequired = function(req, res, next){
	var user = req.session.user;

	if(user.role <= 10){
		return res.redirect('/admin/signin');
	}
	next();
};