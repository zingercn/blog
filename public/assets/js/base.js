// checkbox组件
$(document).on('change', '.checkbox', function(e) {
	$(this).toggleClass('checked');
});
// radio组件
$(document).on('change', '.radio', function(e) {
	$(this).toggleClass('checked').siblings().removeClass('checked');
});
// toggle组件
$(document).on('click', '.toggle', function(e) {
	$(this).toggleClass('toggle-off');
});
// tags组件
$(document).on('click', '.tags .tags-remove', function(e) {
	var $this = $(this);
	$this.parent().remove();
});
$(document).on('click', '.tags .tags-plus', function(e) {
	var $this = $(this);
	var $tags = $this.parents('.tags');
	var $tags_text = $tags.find('.tags-text');
	var $tags_input = $tags.find('.tags-input');
	var input_text = $.trim($tags_input.val());

	$tags_input.focus().removeClass('error');
	if (input_text == '') {
		return;
	}

	var isRepeat = false;
	$tags_text.each(function(index, element) {
		if ($(this).text() == input_text) {
			isRepeat = true;
		}
	});
	if (isRepeat) {
		$tags_input.addClass('error');
	} else {
		var html = '';
		html += '<span class="tag">';
		html += '<span class="tags-text">' + input_text + '</span>';
		html += '<i class="tags-remove fa fa-remove"></i>';
		html += '</span>';
		$this.parent().before(html);
		$tags_input.removeClass('error').val('');
	}
});
// dialog组件 显示
$(document).on('click', '.dialog-show', function(e) {
	var $target = $(e.target);
	var dialogId = $target.attr('data-dialog');
	if (dialogId) {
		$('#' + dialogId).fadeIn(150);
	}
});
// dialog组件 隐藏
$(document).on('click', '.dialog', function(e) {
	var $target = $(e.target);
	if ($target.hasClass('js-dialog-hide') || $target.parent().hasClass('js-dialog-hide')) {
		$(this).fadeOut(150);
	}
});
// 回到顶部
$(window).on('scroll', function(e) {
	// 滚动条离顶部大于300像素
	if ($(this).scrollTop() > 300) {
		$('#gotop').fadeIn(200);
	} else {
		$('#gotop').fadeOut(200);
	}
});
$('#gotop').on('click', function(e) {
	$('body,html').animate({
		scrollTop: 0
	}, 200);
});

// navbar
$('#nav-list li').eq(parseInt($('#nav-list').data('id'), 10)).addClass('active');

// navbar-menu
$('#navbar-menu').on('click', function(e) {
	$('#nav-list').slideToggle('block')
	$('#main').toggleClass('active')
})
FastClick.attach(document.body);