var path = require('path');
var fs = require('fs');
var Article = require('../models/article.js');
var Comment = require('../models/comment.js');
var Sidebar = require('../models/sidebar.js');
var CategoryEmun = require('../models/categoryEmun.js');
var Pagination = require('../models/pagination.js');
var _ = require('underscore');
var moment = require('moment');

// admin list
exports.bgList = function (req, res) {
	var _startTime = new Date(0);
	var _endTime = Date.now();
	var startTime = '';
	var endTime = '';
	var count = 9;
	var pageIndex = parseInt(req.query.pageIndex, 10) || 1;
	var pageCount = 5;
	var url = '/admin/article/list';

	if(!_.isUndefined(req.query.startTime) && req.query.startTime !== ''){
		_startTime = new Date(req.query.startTime);
		startTime = req.query.startTime;
	}
	if(!_.isUndefined(req.query.endTime) && req.query.endTime !== ''){
		_endTime = new Date(req.query.endTime);
		endTime = req.query.endTime;
	}

	var queryModel = {
		"meta.createAt": {
			"$gte": _startTime,
			"$lt": _endTime
		}
	};

	Article.count(queryModel, function(err, total){
		if(err){
			console.log(err);
		}

		var pagination = new Pagination(count, pageIndex, pageCount, total, url);

		Article
			.find(queryModel)
			.sort('-meta.createAt')
			.skip(pagination.start)
			.limit(pagination.count)
			.exec(function(err, articles){
				if(err){
					console.log(err);
				}
				var _articles = [];
				articles.forEach(function(item){
					item.content = '';
					CategoryEmun.forEach(function(_item){
						if(_item.id == item.category){
							item.categoryName = _item.name;
						}
					});
					_articles.push(item);
				});

				res.render('admin/article-list', {
					title: '文章列表',
					nav: 0,
					articles: _articles,
					pagination: pagination,
					startTime: startTime,
					endTime: endTime
				});
			});
	});
};

// admin add/update page
exports.bgDetail = function (req, res) {
	var id = req.params.id;
	var pageIndex = parseInt(req.query.pageIndex, 10) || 1;
	var startTime = '';
	var endTime = '';

	if(!_.isUndefined(req.query.startTime) && req.query.startTime !== ''){
		startTime = req.query.startTime;
	}
	if(!_.isUndefined(req.query.endTime) && req.query.endTime !== ''){
		endTime = req.query.endTime;
	}

	if(_.isUndefined(id)){
		// add
		res.render('admin/article-detail', {
			title: '文章添加',
			nav: 0,
			article: {},
			pageIndex: pageIndex,
			startTime: startTime,
			endTime: endTime,
			categoryEmun: CategoryEmun
		});
	}
	else{
		// update
		Article.findOne({_id: id}, function(err, article){
			if(err){
				console.log(err);
			}

			res.render('admin/article-detail', {
				title: '文章修改',
				nav: 0,
				article: article,
				pageIndex: pageIndex,
				startTime: startTime,
				endTime: endTime,
				categoryEmun: CategoryEmun
			});
		});
	}
};

// admin add/update 
exports.save = function(req, res){
	var article = req.body;
	var id = article.id;
	var _article;

	if(id === ''){
		_article = new Article(article);
		_article.save(function(err, article){
			if(err){
				console.log(err);
			}

			return res.json({status: 1, msg: 'success'});
		});
	}
	else{
		Article.findOne({_id: id}, function(err, articleObj){
			if(err){
				console.log(err);
			}

			_article = _.extend(articleObj, article);
			_article.save(function(err, article){
				if(err){
					console.log(err);
				}

				return res.json({status: 1, msg: 'success'});
			});
		});
	}
};

// admin del
exports.del = function(req, res){
	var id = req.body.id;

	Article.remove({_id: id}, function(err, doc){
		if(err){
			console.log(err);
		}

		return res.json({status: 1, msg: 'success'});
	});
};

// admin openControl
exports.openControl = function(req, res){
	var id = req.body.id;
	var open = req.body.open;
	var _open;

	if(open == 'true'){
		_open = false;
	}
	else{
		_open = true;
	}

	Article.update({_id: id},{$set: {open: _open}}, function(err, doc){
		if(err){
			console.log(err);
		}

		return res.json({status: 1, msg: 'success'});
	});
};

// admin imageload
exports.imageload = function(req, res){
	var dir = '/admin/assets/images/demo/';
	fs.readdir( './public'+ dir, function(err, files){
		if(err){
			console.log(err);
		}
		var arr = [];
		files.forEach(function(item){//forEach 不会改变原先的数组
			arr.push(dir + item);
		});
		return res.json({status:1, files:arr});
	});
};

// admin fileupload
exports.fileupload = function(req, res){
	var file = req.files.file;
	var arr = file.path.split(path.sep);//将路径分割成数组
	arr.shift();//去除public
	var filepath = '/' + arr.join('/');//拼接路径
	return res.json({state:1, url:filepath});
};

// 前台 文章按时间查询列表
exports.listByTime = function(req, res){
	var time = req.params.time;
	var category = parseInt(req.query.category, 10) || 1;
	var count = 9;
	var pageIndex = parseInt(req.query.pageIndex, 10) || 1;
	var url = '/article/list';

	// 类型判断
	if(category > 2 || category < 1){
		category = 1;
	}

	var queryModel;
	// 搜索判断
	if(_.isUndefined(time) || _.isNaN(new Date(time).getTime())){
		queryModel = {
			category: category,
			open: true
		};
	}
	else{
		url += '/'+time;
		var startTime = new Date(time);
		var endTime = new Date(moment(startTime).add(1, 'M'));
		queryModel = {
			category: category,
			open: true,
			"meta.createAt": {
				$gte: startTime,
				$lt: endTime
			}
		};
	}

	Sidebar.find({category: category}, function(err, sidebars){
		if(err){
			console.log(err);
		}
		
		Article.count(queryModel, function(err, total){
			if(err){
				console.log(err);
			}

			var pagination = new Pagination(count, pageIndex, 0, total, url);

			Article
				.find(queryModel)
				.sort('-meta.createAt')
				.skip(pagination.start)
				.limit(pagination.count)
				.exec(function(err, docs){
					if(err){
						console.log(err);
					}
					var _articles = [];
					docs.forEach(function(item){
						item.content = '';
						_articles.push(item);
					});

					var renderUrl;
					var nav;
					var title;
					switch(category){
						case 1:
							renderUrl = 'article/list';
							title = '技术-zinger的博客';
							nav = 1;
							break;
						case 2:
							renderUrl = 'article/life-list';
							title = '生活-zinger的博客';
							nav = 2;
							break;
					}

					res.render(renderUrl, {
						title: title,
						nav: nav,
						articles: _articles,
						category: category,
						pagination: pagination,
						s: '',
						sidebars: sidebars
					});
				});
		});
	});
};

// 前台 查询列表
exports.search = function(req, res){
	var s = req.query.s;
	var category = parseInt(req.query.category, 10) || 1;
	var count = 9;
	var pageIndex = parseInt(req.query.pageIndex, 10) || 1;
	var url = '/article/list';

	// 类型判断
	if(category > 2 || category < 1){
		category = 1;
	}

	var queryModel;
	// 搜索判断
	if(_.isUndefined(s) || s === ''){
		s = '';
		queryModel = {
			category: category,
			open: true
		};
	}
	else{
		queryModel = {
			category: category,
			open: true,
			$or: [
				{
					title: new RegExp(s+'.*','i')
				},{
					summary: new RegExp(s+'.*','i')
				},{
					tags: new RegExp(s+'.*','i')
				}
			]
		};
	}

	Sidebar.find({category: category}, function(err, sidebars){
		if(err){
			console.log(err);
		}

		Article.count(queryModel, function(err, total){
			if(err){
				console.log(err);
			}

			var pagination = new Pagination(count, pageIndex, 0, total, url);

			Article
				.find(queryModel)
				.sort('-meta.createAt')
				.skip(pagination.start)
				.limit(pagination.count)
				.exec(function(err, docs){
					if(err){
						console.log(err);
					}
					var _articles = [];
					docs.forEach(function(item){
						item.content = '';
						_articles.push(item);
					});

					var renderUrl;
					var nav;
					var title;
					switch(category){
						case 1:
							renderUrl = 'article/list';
							title = '技术-zinger的博客';
							nav = 1;
							break;
						case 2:
							renderUrl = 'article/life-list';
							title = '生活-zinger的博客';
							nav = 2;
							break;
					}

					res.render(renderUrl, {
						title: title,
						nav: nav,
						articles: _articles,
						category: category,
						pagination: pagination,
						sidebars: sidebars,
						s: s
					});
				});
		});
	});
};

// 前台文章详情列表
exports.detail = function(req, res){
	var id = req.params.id;
	var bgView = req.query.bgView;
	
	if(_.isUndefined(bgView)){//非后台查看浏览次数加一
		Article.update({_id: id}, {$inc: {pv: 1}}, function(err){
			if(err){
				console.log(err);
			}
		});
	}

	Article.findOne({_id: id}, function(err, doc){
		if(err){
			console.log(err);
		}

		Comment
			.find({article: id})
			.sort('-meta.createAt')
			.exec(function(err, comments){
				if(err){
					console.log(err);
				}

				Sidebar.find({category: doc.category}, function(err, sidebars){
					if(err){
						console.log(err);
					}

					var nav;
					switch(doc.category){
						case 1:
							nav = 1;
							break;
						case 2:
							nav = 2;
							break;
					}

					res.render('article/detail', {
						title: doc.title,
						nav: nav,
						sidebars: sidebars,
						category: doc.category,
						article: doc,
						comments: comments
					});
				});
			});

	});
};