var Comment = require('../models/comment.js');
var Pagination = require('../models/pagination.js');
var _ = require('underscore');

// 后台列表
exports.bgList = function (req, res) {
	var _startTime = new Date(0);
	var _endTime = Date.now();
	var startTime = '';
	var endTime = '';
	var count = 9;
	var pageIndex = parseInt(req.query.pageIndex, 10) || 1;
	var pageCount = 5;
	var url = '/admin/comment/list';

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

	Comment.count(queryModel, function(err, total){
		if(err){
			console.log(err);
		}

		var pagination = new Pagination(count, pageIndex, pageCount, total, url);

		Comment
			.find(queryModel)
			.populate('article', 'title')
			.sort('-meta.createAt')
			.skip(pagination.start)
			.limit(pagination.count)
			.exec(function(err, comments){
				if(err){
					console.log(err);
				}
				var _comments = [];
				comments.forEach(function(item){
					// item.content = '';
					if(item.article === null){
						item.article = {title: '该文章已删除'};
					}
					_comments.push(item);
				});

				res.render('admin/comment-list', {
					title: '文章列表',
					nav: 2,
					comments: _comments,
					pagination: pagination,
					startTime: startTime,
					endTime: endTime
				});
			});
	});
};

// save
exports.save = function(req, res){
	var comment = req.body;
	var _comment = new Comment(comment);

	_comment.save(function(err, doc){
		if(err){
			console.log(err);
		}

		return res.json({status: 1, msg: 'success'});
	});
};

// del
exports.del = function(req, res){
	var id = req.body.id;

	Comment.remove({_id: id}, function(err, comment){
		if(err){
			console.log(err);
		}

		return res.json({status: 1, msg: 'success'});
	});
};