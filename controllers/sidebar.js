var Sidebar = require('../models/sidebar.js');
var _ = require('underscore');
var CategoryEmun = require('../models/categoryEmun.js');

// admin add/update page
exports.bgDetail = function (req, res) {
	var id = req.params.id;

	if(_.isUndefined(id)){
		// add
		res.render('admin/sidebar-detail', {
			title: '侧边栏添加',
			nav: 1,
			sidebar: {},
			categoryEmun: CategoryEmun
		});
	}
	else{
		// update
		Sidebar.findOne({_id: id}, function(err, sidebar){
			if(err){
				console.log(err);
			}

			res.render('admin/sidebar-detail', {
				title: '侧边栏修改',
				nav: 1,
				sidebar: sidebar,
				categoryEmun: CategoryEmun
			});
		});
	}
};

// admin add/update 
exports.save = function(req, res){
	var sidebar = req.body;
	var id = sidebar.id;
	var _sidebar;

	if(id === ''){
		_sidebar = new Sidebar(sidebar);
		_sidebar.save(function(err, sidebar){
			if(err){
				console.log(err);
			}

			return res.json({status: 1, msg: 'success'});
		});
	}
	else{
		Sidebar.findOne({_id: id}, function(err, sidebarObj){
			if(err){
				console.log(err);
			}

			_sidebar = _.extend(sidebarObj, sidebar);
			_sidebar.save(function(err, sidebar){
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

	Sidebar.remove({_id: id}, function(err, doc){
		if(err){
			console.log(err);
		}

		return res.json({status: 1, msg: 'success'});
	});
};

// admin list
exports.bgList = function(req, res){
	Sidebar
		.find({})
		.sort('-meta.createAt')
		.exec(function(err, docs){
			if(err){
				console.log(err);
			}
			var _docs = [];
			docs.forEach(function(item){
				item.content = '';
				CategoryEmun.forEach(function(_item){
					if(_item.id == item.category){
						item.categoryName = _item.name;
					}
				});
				_docs.push(item);
			});

			res.render('admin/sidebar-list', {
				title: '侧边栏列表',
				nav: 1,
				sidebars: _docs
			});
		});
};