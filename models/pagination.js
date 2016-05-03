/**
 * [pagination 分页类] 
 * @param  {[type]} count     [每页显示数量]
 * @param  {[type]} pageIndex [当前页码 从1开始]
 * @param  {[type]} pageCount [每页显示的页码数]
 * @param  {[type]} total     [数据总数]
 * @param  {[type]} url   [页码请求的url]
 * @return {[type]}           [description]
 */
var pagination = function (count, pageIndex, pageCount, total, url) {
	this.count = count; // 每页显示数量
	this.pageIndex = pageIndex; // 页码
	this.start = (this.pageIndex - 1) * this.count; // 查询起始位置
	this.pageCount = pageCount; // 每页显示的页码数
	this.pageStart = 1; //页码起始位置
	this.pageEnd = 1; //页码结束位置
	this.pageTotal = 1; //页码总数
	this.total = total; // 数据总数
	this.url = url; //页码请求的url
	this.setTotal(total);
};

pagination.prototype.setTotal = function(total){
	this.total = total;

	this.pageTotal = Math.ceil(this.total / this.count);

	this.pageStart = parseInt(this.pageIndex - Math.floor(this.pageCount/2), 10);
	this.pageEnd = parseInt(this.pageIndex + Math.ceil(this.pageCount/2) - 1, 10);

	if(this.pageStart < 1){
		this.pageStart = 1;
	}
	if(this.pageEnd > this.pageTotal){
		this.pageEnd = this.pageTotal;
	}

	this.pageCount = this.pageEnd - this.pageStart + 1;
};

module.exports = pagination;