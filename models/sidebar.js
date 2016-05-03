var mongoose = require('mongoose');

var sidebarSchema = new mongoose.Schema({
	// 标题
	title: String,
	// 图标
	icon: String,
	// 1：技术类
	// 2：生活类
	category: Number,
	isTime:{
		type: Boolean,
		default: false
	},
	// 类别列表
	list: [],
	meta: {
		createAt: {
			type: Date,
			default: Date.now()
		},
		updateAt: {
			type: Date,
			default: Date.now()
		}
	}
});

sidebarSchema.pre('save', function(next) {
	var user = this;
	if(this.isNew){
		this.meta.createAt = this.meta.updateAt = Date.now();
	}
	else{
		this.meta.updateAt = Date.now();
	}
	
	next();
});

sidebarSchema.methods = {

};

sidebarSchema.statics = {
	fetch: function(cb){
		return this
			.find({})
			.sort('meta.createAt')
			.exec(cb);
	}
};

var sidebar = mongoose.model('sidebar', sidebarSchema);
module.exports = sidebar;