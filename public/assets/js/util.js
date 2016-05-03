var util = {
	//封装ajax
	ajax: function(param) {
		var _id = 'util-ajax-bg';
		var id = '#' + _id;
		if (!param.hidden) {
			var len = $(id).length;
			if (len < 1) {
				$("body").append('<div id="' + _id + '" class="util-ajax-bg"><i class="icon"></i></div>');
			}
			$(id).show();
		}
		//默认参数
		var _param = {
			url: "",
			data: {},
			type: "POST",
			async: true,
			success: function(data, param) {},
			error: function(data, param) {},
			param: {}
		};
		//合并参数
		var newParam = $.extend(_param, param);
		$.ajax({
			url: newParam.url,
			type: newParam.type,
			data: newParam.data,
			async: newParam.async,
			success: function(data) {
				var oData = $.parseJSON(data);
				newParam.success(oData, newParam.param);
				if (!newParam.hidden) {
					$(id).hide();
				}
			},
			error: function(data) {
				var oData = $.parseJSON(data);
				newParam.error(oData, newParam.param);
				if (!newParam.hidden) {
					$(id).hide();
				}
			},
			dataType: "text"
		});
	},
	// file: 文件input
	// fileBtn：文件上传按钮
	// fileText：文件路径显示input
	fileupload: function(file, fileBtn, fileText, url) {
		fileBtn.off(".upload");
		file.off(".upload");

		fileBtn.on('click.upload', function(e) {
			file.trigger('click');
		});
		// change事件
		file.on('change.upload', function(e) {
			fileText.val('');
			var files = $(this)[0].files;
			if (files && files[0] && files[0].type) {
				var _file = files[0];

				var xhr = new XMLHttpRequest();
				xhr.addEventListener('readystatechange', function() {
					if (xhr.readyState == 4) {
						var data = JSON.parse(xhr.responseText);
						fileText.val(data.url);
					}
				});
				xhr.open('post', url, true);

				var fd = new FormData();
				fd.append('file', _file);
				xhr.send(fd);
			}
		});
	},
	// 提示框 
	// type: default,primary,success,error
	// time: 延迟时间
	// content：内容
	// callback：回调函数
	promot: function(option) {
		var _option = {
			id: 'util-promot',
			type: 'default',
			content: 'promot',
			time: 2000,
			callback: function() {}
		}

		option = $.extend(_option, option);
		// 消除之前存在的promot
		$('#' + option.id).remove();
		// 重置time
		if (option.time < 2000 || !_.isNumber(option.time)) {
			option.time = 2000;
		}

		var html = '';
		switch (option.type) {
			case 'default':
				html += '<div class="util-promot" id="' + option.id + '">';
				break;
			case 'primary':
				html += '<div class="util-promot primary" id="' + option.id + '">';
				break;
			case 'success':
				html += '<div class="util-promot success" id="' + option.id + '">';
				break;
			case 'error':
				html += '<div class="util-promot error" id="' + option.id + '">';
				break;
			default:
				html += '<div class="util-promot" id="' + option.id + '">';

		}
		html += '<div class="util-promot-area">' + option.content + '</div></div>';

		$('body').append(html);
		$('#' + option.id).fadeIn(200);

		setTimeout(function() {
			$('#' + option.id).hide();
			option.callback();
		}, option.time);
	},
	// 确定框
	// type：default,primary,delete
	// title: 标题
	// content: 内容
	// width: 长度
	// btnAlign: 按钮位置 center left right
	// okBtn: 确定按钮
	// cancelBtn: 取消按钮
	// callback: 确定按钮回调函数
	// id: 提示框id
	confirm: function(option) {
		var _option = {
			id: "util-confirm",
			type: "default",
			width: "300px",
			title: "提示",
			content: "内容",
			btnAlign: 'center',
			okBtn: "确定",
			cancelBtn: "取消",
			callback: function() {}
		};
		var opt = $.extend(_option, option);
		var confirm_id = opt.id;

		var module = {
			init: function() {
				this.initDom();
				this.initEvent();
			},
			initDom: function() {
				var html = '';
				html += '<div class="util-confirm" id="' + confirm_id + '">';

				html += '<div class="util-confirm-view">';
				html += '<div class="util-confirm-head">';
				html += '<span class="util-confirm-title">' + opt.title + '</span>';
				html += '<span class="util-confirm-close"><i class="fa fa-remove"></i></span>';
				html += '</div>';
				html += '<div class="util-confirm-content">' + opt.content + '</div>';
				switch (opt.btnAlign) {
					case 'center':
						html += '<div class="util-confirm-footer tc">';
						break;
					case 'left':
						html += '<div class="util-confirm-footer tl">';
						break;
					case 'right':
						html += '<div class="util-confirm-footer tr">';
						break;
					default:
						html += '<div class="util-confirm-footer tc">';
						break;
				}

				switch (opt.type) {
					case "default":
						html += '<a href="javascript:;" class="btn btn-ok">' + opt.okBtn + '</a>';
						break;
					case "primary":
						html += '<a href="javascript:;" class="btn btn-ok btn-primary">' + opt.okBtn + '</a>';
						break;
					case "delete":
						html += '<a href="javascript:;" class="btn btn-ok btn-danger">' + opt.okBtn + '</a>';
						break;
					default:
						html += '<a href="javascript:;" class="btn btn-ok">' + opt.okBtn + '</a>';
				}

				html += '<a href="javascript:;" class="btn btn-cancel">' + opt.cancelBtn + '</a>';
				html += '</div>';
				html += '</div>';
				html += '</div>';
				$("body").append(html);

				var $view = $("#" + confirm_id).find(".util-confirm-view");
				$view.css({
					width: opt.width
				});

				this.show();
			},
			//初始化事件
			initEvent: function() {
				// 清除原先事件
				$(document).off("." + opt.id);
				// 关闭按钮
				$(document).on("click" + "." + opt.id, "#" + confirm_id + " .util-confirm-close", function(e) {
					module.hide();
				});
				// 取消按钮
				$(document).on("click" + "." + opt.id, "#" + confirm_id + " .btn-cancel", function(e) {
					module.hide();
				});
				// 确定按钮
				$(document).on("click" + "." + opt.id, "#" + confirm_id + " .btn-ok", function(e) {
					module.hide();
					opt.callback();
				});
			},
			hide: function() {
				$("#" + confirm_id).remove();
			},
			show: function() {
				$("#" + confirm_id).fadeIn(200);
			}
		};
		module.init();
	}
};