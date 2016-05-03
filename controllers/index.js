var domain = require('domain');

exports.home = function(req, res){
	res.render('index', {
		title: 'zinger的博客，分享前端技术，分享生活感悟',
		nav: 0
	});
};
exports.err500 = function (req, res, next) {
	var reqDomain = domain.create();
	reqDomain.on('error', function (err) {
		res.render('500', {
			title: '500'
		});
	});

	reqDomain.run(next);
};
exports.err404 = function(req, res){
	res.render('404', {
		title: '404'
	});
};