var mongoose = require('mongoose');

var ArticleSchema = new mongoose.Schema({
	// 标题
	title: String,
	// 1：技术类
	// 2：生活类
	category: Number,
	// 缩略图
	thumb: String,
	// 摘要
	summary: String,
	// 标签
	tags: [],
	// 是否公开
	open: {
		type: Boolean,
		default: true
	},
	// 内容
	content: String,
	// 阅读次数
	pv: {
		type: Number,
		default: 0
	},
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

ArticleSchema.pre('save', function(next) {
	var user = this;
	if(this.isNew){
		this.meta.createAt = this.meta.updateAt = Date.now();
	}
	else{
		this.meta.updateAt = Date.now();
	}
	
	next();
});

ArticleSchema.methods = {

};

ArticleSchema.statics = {
	fetch: function(cb){
		return this
			.find({})
			.sort('meta.createAt')
			.exec(cb);
	}
};

var Article = mongoose.model('Article', ArticleSchema);
module.exports = Article;