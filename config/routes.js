var User = require('../controllers/user.js');
var Article = require('../controllers/article.js');
var Comment = require('../controllers/comment.js');
var Sidebar = require('../controllers/sidebar.js');
var Index = require('../controllers/index.js');

module.exports = function(app) {
	// 避免服务器崩溃
	process.on('uncaughtException', function(err) {
		console.log(err);
	});

	// 错误处理 500
	app.use(Index.err500);

	// 预处理 user
	app.use(function(req, res, next) {
		var user = req.session.user;
		app.locals.user = user;
		return next();
	});

	// user
	app.post('/admin/user/signin', User.signin);
	app.post('/admin/user/signup', User.signup);
	app.get('/admin/user/signout', User.signout);
	app.get('/admin/signin', User.showSignin);
	app.get('/admin/signup', User.showSignup);

	//index
	app.get('/', Article.search);
	// admin index
	app.get('/admin', User.signinRequired, User.adminRequired, Article.bgList);

	// article
	app.get('/article/list', Article.search);
	// 时间分类搜索
	app.get('/article/list/:time', Article.listByTime);
	app.get('/article/detail/:id', Article.detail);

	// article admin
	app.get('/admin/article', User.signinRequired, User.adminRequired, Article.bgList);
	app.get('/admin/article/list', User.signinRequired, User.adminRequired, Article.bgList);
	app.get('/admin/article/detail', User.signinRequired, User.adminRequired, Article.bgDetail);
	app.get('/admin/article/detail/:id', User.signinRequired, User.adminRequired, Article.bgDetail);
	app.post('/admin/article/save', User.signinRequired, User.adminRequired, Article.save);
	app.post('/admin/article/del', User.signinRequired, User.adminRequired, Article.del);
	app.post('/admin/article/openControl', User.signinRequired, User.adminRequired, Article.openControl);
	// 图片加载
	app.get('/admin/article/imageload', User.signinRequired, User.adminRequired, Article.imageload);
	// 文件上传
	app.post('/admin/article/fileupload', User.signinRequired, User.adminRequired, Article.fileupload);

	// sidebar admin
	app.get('/admin/sidebar/list', User.signinRequired, User.adminRequired, Sidebar.bgList);
	app.get('/admin/sidebar/detail', User.signinRequired, User.adminRequired, Sidebar.bgDetail);
	app.get('/admin/sidebar/detail/:id', User.signinRequired, User.adminRequired, Sidebar.bgDetail);
	app.post('/admin/sidebar/save', User.signinRequired, User.adminRequired, Sidebar.save);
	app.post('/admin/sidebar/del', User.signinRequired, User.adminRequired, Sidebar.del);

	// comment
	app.post('/comment/save', Comment.save);
	app.get('/admin/comment/list', User.signinRequired, User.adminRequired, Comment.bgList);
	app.post('/admin/comment/del', User.signinRequired, User.adminRequired, Comment.del);

	// 404
	app.get('*', Index.err404);
};