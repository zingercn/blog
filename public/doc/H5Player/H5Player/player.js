/*
 * player.js
 * by gaojie 2015-02-07
 * html5 video plugin
**/
var H5Player = (function (){
	var Player = function(){
		this.msgTimer = null;
		this.toolTimer = null;
		this.timeDrag = false;
		this.volumeDrag = false;
		this.isFull = false;
		this.isShow = false;
		//播放器参数
		this.local = {
			volume: 1,
			isMute: false 
		};
		this.$player_bg = null;
		this.$player = null;
		this.$video = null;
		this.$close_btn = null;
		this.$loading = null;
		this.$msg = null;
		this.$player_ctrl = null;
		this.$time_progress = null;
		this.$loadline = null;
		this.$timeline = null;
		this.$play_btn = null;
		this.$current_time = null;
		this.$total_time = null;
		this.$volume_btn = null;
		this.$volume_progress = null;
		this.$volumeline = null;
		this.$full_btn = null;
	};
	Player.prototype.init = function(id){
		this.initDom(id);
		this.initLocal();
		this.initEvent();
	};
	Player.prototype.initEvent = function(){
		//关闭按钮click事件
		this.$close_btn.addEventListener('click',function(e){
			this.$player_bg.style.display = 'none';
			this.isShow = false;
			this.exitFullscreen();
			this.$player.classList.remove('full');
			this.isFull = false;
			this.$video.pause();
		}.bind(this));
		//播放按钮click事件
		this.$play_btn.addEventListener('click',function(e){
			this.hideMsg();//清除样式
			if(this.$video.paused){
				this.play();
				this.showMsg('pause');//添加样式，显示提示
			}else{
				this.pause();
				this.showMsg('play');//添加样式，显示提示
			}
			clearTimeout(this.msgTimer);
			this.msgTimer= setTimeout(function(){
				clearTimeout(this.msgTimer);
				this.hideMsg();//隐藏提示
			}.bind(this),500);
		}.bind(this));
		//video click事件
		this.$video.addEventListener('click',function(e){
			this.trigger(this.$play_btn,'click');
		}.bind(this));
		//是否静音按钮click事件
		this.$volume_btn.addEventListener('click',function(e){
			e.preventDefault();
			e.stopPropagation();
			if(this.local.isMute){
				this.$video.volume = this.local.volume;
				this.$volume_btn.classList.remove('icon-h5player-volume-mute');
				this.local.isMute = false;
			}else{
				this.$video.volume = 0;
				this.$volume_btn.classList.add('icon-h5player-volume-mute');
				this.local.isMute = true;
			}
			this.setObjectLocal('h5player-local',this.local);
		}.bind(this));
		//是否全屏按钮click事件
		this.$full_btn.addEventListener('click',function(e){
			if(this.isFull){
				this.exitFullscreen();
				this.$player.classList.remove('full');
				this.$full_btn.classList.add('icon-h5player-enlarge');
				this.$full_btn.classList.remove('icon-h5player-shrink');
				this.isFull = false;
			}else{
				this.launchFullscreen(this.$player);
				this.$player.classList.add('full');
				this.$full_btn.classList.add('icon-h5player-shrink');
				this.$full_btn.classList.remove('icon-h5player-enlarge');
				this.isFull = true;
			}
		}.bind(this));
		//视频播放事件
		this.$video.addEventListener('play',function(e){
			this.play();
		}.bind(this));
		//视频结束事件
		this.$video.addEventListener('ended',function(e){
			this.pause();
		}.bind(this));
		//视频loadstart事件
		this.$video.addEventListener('loadstart',function(e){
			this.$loading.style.display = 'inline-block';
		}.bind(this));
		//视频loadedmetadata事件，成功加载
		this.$video.addEventListener('loadedmetadata',function(e){
			this.$loading.style.display = 'none';
			//初始化视频总长
			this.$total_time.innerHTML = this.timeFormat(this.$video.duration);
			clearTimeout(this.toolTimer);
			this.toolTimer = setTimeout(function(){
				this.hideTool();
				clearTimeout(this.toolTimer);
			}.bind(this),4000);
		}.bind(this));
		//视频timeupdate事件
		this.$video.addEventListener('timeupdate',function(e){
			this.timeupdate();
		}.bind(this));
		// 视频progress事件
		this.$video.addEventListener('progress',function(e){
			// this.progress();
		}.bind(this));
		//视频waiting事件
		this.$video.addEventListener('waiting',function(e){
			this.$loading.style.display = 'inline-block';
		}.bind(this));
		// 视频error事件
		this.$video.addEventListener('error',function(e){
			this.$loading.style.display = 'inline-block';
		}.bind(this));
		//player mousemove事件
		this.$player.addEventListener('mousemove',function(e){
			this.showTool();
			clearTimeout(this.toolTimer);
			this.toolTimer = setTimeout(function(){
				this.hideTool();
				clearTimeout(this.toolTimer);
			}.bind(this),4000);
		}.bind(this));
		//mousedown事件
		document.body.addEventListener('mousedown',function(e){
			this.mousedown(e);
		}.bind(this));
		//mousemove事件
		document.body.addEventListener('mousemove',function(e){
			this.mousemove(e);
		}.bind(this));
		//mouseup事件
		document.body.addEventListener('mouseup',function(e){
			this.mouseup(e);
		}.bind(this));
		// 键盘事件
		document.body.addEventListener('keydown',function(e){
			if(this.isShow){
				switch(e.keyCode){
					case 32://空格
						this.trigger(this.$play_btn,'click');
						break;
					case 37://左
						this.$video.currentTime -= 10;
						if(this.$video.currentTime < 0){
							this.$video.currentTime = 0;
						}
						this.$current_time.innerHTML = this.timeFormat(this.$video.currentTime);
						this.$timeline.style.width = (this.$video.currentTime/this.$video.duration*100)+'%';
						break;
					case 38://上
						this.local.volume += 0.1;
						if(this.local.volume > 1){
							this.local.volume = 1;
						}
						this.$video.volume = this.local.volume;
						this.$volumeline.style.width = this.local.volume*100 + '%';
						this.setObjectLocal('h5player-local',this.local);
						break;
					case 39://右
						this.$video.currentTime += 10;
						if(this.$video.currentTime > this.$video.duration){
							this.$video.currentTime = this.$video.duration;
						}
						this.$current_time.innerHTML = this.timeFormat(this.$video.currentTime);
						this.$timeline.style.width = (this.$video.currentTime/this.$video.duration*100)+'%';
						break;
					case 40://下
						this.local.volume -= 0.1;
						if(this.local.volume < 0){
							this.local.volume = 0;
						}
						this.$video.volume = this.local.volume;
						this.$volumeline.style.width = this.local.volume*100 + '%';
						this.setObjectLocal('h5player-local',this.local);
						break;
				}
			}
		}.bind(this));
	};
	//初始化播放器参数
	Player.prototype.initLocal = function(){
		var local = this.getObjectLocal('h5player-local');
		if(!local){
			local = this.local;
		}
		//初始化音量
		if(local.volume){
			try{
				this.local.volume = parseFloat(local.volume);
			}catch(err){
				this.local.volume = 1;
			}
			this.local.volume = this.local.volume < 1 ? this.local.volume : 1;
			this.$video.volume = this.local.volume;
			this.$volumeline.style.width = this.local.volume*100 + '%';
		}else{
			this.local.volume = 1;
		}
		// 是否静音
		if(local.isMute && local.isMute === true){
			this.local.isMute = true;
			this.$video.volume = 0;
			this.$volume_btn.classList.add('icon-h5player-volume-mute');
		}else{
			this.local.isMute = false;
		}
		this.setObjectLocal('h5player-local',this.local);
	};
	//加载视频
	Player.prototype.load = function(){
		this.$current_time.innerHTML = this.timeFormat(0);
		this.$total_time.innerHTML = this.timeFormat(0);
		this.$timeline.style.width = 0;
		this.$loadline.style.width = 0;
		this.$video.load();
	};
	//播放视频
	Player.prototype.play = function(){
		this.$video.play();
		this.$play_btn.classList.remove('icon-h5player-play');
		this.$play_btn.classList.add('icon-h5player-pause');
	};
	//暂停视频
	Player.prototype.pause = function(){
		this.$video.pause();
		this.$play_btn.classList.remove('icon-h5player-pause');
		this.$play_btn.classList.add('icon-h5player-play');
	};
	//视频进度更新
	Player.prototype.timeupdate = function(){
		this.$loading.style.display = 'none';
		if(!this.timeDrag){//非拖动时，改变ui，避免进度条抖动问题
			this.$current_time.innerHTML = this.timeFormat(this.$video.currentTime);
			var lineWidth = (this.$video.currentTime/this.$video.duration*100)+'%';
			this.$timeline.style.width = lineWidth;
		}
	};
	//视频缓存加载
	Player.prototype.progress = function(){
		// 缓存计算，有问题，蛋疼。。。
		if(this.$video.readyState == 4){
			var timeRanges = this.$video.buffered;
			// console.log(timeRanges);
			var lineWidth = (timeRanges.end(timeRanges.length-1)/this.$video.duration*100)+'%';
			this.$loadline.style.width = lineWidth;
		}
	};
	//显示提示
	Player.prototype.showMsg = function(type){
		this.$msg.style.display = 'inline-block';
		switch(type){
			case 'play':
				this.$msg.classList.add('icon-h5player-play');
				break;
			case 'pause':
				this.$msg.classList.add('icon-h5player-pause');
				break;
		}
	};
	//隐藏提示
	Player.prototype.hideMsg = function(){
		this.$msg.style.display = 'none';
		this.$msg.classList.remove('icon-h5player-play');
		this.$msg.classList.remove('icon-h5player-pause');
	};
	//显示控制控件
	Player.prototype.showTool = function(){
		this.$close_btn.style.display = "inline-block";
		this.$player_ctrl.classList.remove('h5player-ctrl-hide');
	};
	//隐藏控制控件
	Player.prototype.hideTool = function(){
		this.$close_btn.style.display = "none";
		this.$player_ctrl.classList.add('h5player-ctrl-hide');
	};
	// mousedown
	Player.prototype.mousedown = function(e){
		var drag = e.target.getAttribute('drag') || e.target.parentNode.getAttribute('drag');
		var ratio;
		if(drag == 'time'){
			this.timeDrag = true;
			this.$player_bg.style.cursor = 'inherit';
			ratio = this.getTimeRadio(e);
			if(ratio > 1){
				ratio = 1;
			}
			this.$timeline.style.width = ratio*100 + '%';
			return;
		}
		if(drag == 'volume'){
			this.volumeDrag = true;
			this.$player_bg.style.cursor = 'inherit';
			ratio = this.getVolumeRadio(e);
			if(ratio > 1){
				ratio = 1;
			}
			this.$volumeline.style.width = ratio*100 + '%';
			return;
		}
	};
	// mousemove
	Player.prototype.mousemove = function(e){
		var ratio;
		if(this.timeDrag){
			this.$player_bg.style.cursor = 'pointer';
			ratio = this.getTimeRadio(e);
			if(ratio > 1){
				ratio = 1;
			}
			this.$timeline.style.width = ratio*100 + '%';
			return;
		}
		if(this.volumeDrag){
			this.$player_bg.style.cursor = 'pointer';
			ratio = this.getVolumeRadio(e);
			if(ratio > 1){
				ratio = 1;
			}
			this.$volumeline.style.width = ratio*100 + '%';
			return;
		}
	};
	// mouseup
	Player.prototype.mouseup = function(e){
		var ratio;
		if(this.timeDrag){
			this.timeDrag = false;
			this.$player_bg.style.cursor = 'inherit';
			ratio = this.getTimeRadio(e);
			if(ratio > 1){
				ratio = 1;
			}
			this.$video.currentTime = this.$video.duration*ratio;
			return;
		}
		if(this.volumeDrag){
			this.volumeDrag = false;
			this.$player_bg.style.cursor = 'inherit';
			ratio = this.getVolumeRadio(e);
			if(ratio > 1){
				ratio = 1;
			}
			this.$video.volume = 1*ratio;
			this.local.volume = this.$video.volume;
			this.setObjectLocal('h5player-local',this.local);
			return;
		}
	};
	//创建播放器
	Player.prototype.initDom = function(id){
		var html = 
		'<div class="h5player-bg" id="h5player-bg" onselectstart="return false;">\
			<div class="h5player" id="h5player">\
				<div class="h5player-content">\
					<video id="h5player-video" class="h5player-video" autoplay>\
					</video>\
				</div>\
				<i class="icon-h5player icon-h5player-cross h5player-close-btn" id="h5player-close-btn"></i>\
				<i class="icon-h5player icon-h5player-spinner h5player-loading" id="h5player-loading"></i>\
				<i class="icon-h5player h5player-msg" id="h5player-msg"></i>\
				<div class="h5player-ctrl" id="h5player-ctrl">\
					<div class="h5player-time-progress" id="h5player-time-progress" drag="time">\
						<div class="h5player-loadline" id="h5player-loadline"></div>\
						<div class="h5player-timeline" id="h5player-timeline"></div>\
					</div>\
					<div class="h5player-toolbar">\
						<div class="h5player-toolbar-left">\
							<i class="icon-h5player icon-h5player-play h5player-play-btn" id="h5player-play-btn"></i>\
						    <div class="h5player-time">\
								<span class="current" id="h5player-time-current">00:00:00</span>&nbsp;/&nbsp;<span class="total" id="h5player-time-total">00:00:00</span>\
							</div>\
						</div>\
						<div class="h5player-toolbar-right">\
							<i class="icon-h5player icon-h5player-volume-medium h5player-volume-btn " id="h5player-volume-btn"></i>\
							<div class="h5player-volume-progress"  id="h5player-volume-progress" drag="volume">\
								<div class="h5player-volumeline" id="h5player-volumeline"></div>\
							</div>\
							<i class="icon-h5player icon-h5player-enlarge h5player-full-btn"  id="h5player-full-btn"></i>\
						</div>\
					</div>\
				</div>\
			</div>\
		</div>';
		var div = document.createElement('div');
		div.innerHTML = html;
		div = div.querySelector("#h5player-bg");
		document.body.appendChild(div);
		this.getDom();
		this.bindVideo(id);
		this.isShow = true;
	};
	//获取dom
	Player.prototype.getDom = function(){
		this.$player_bg = document.querySelector('#h5player-bg');
		this.$player = document.querySelector('#h5player');
		this.$video = document.querySelector('#h5player-video');
		this.$close_btn = document.querySelector('#h5player-close-btn');
		this.$loading = document.querySelector('#h5player-loading');
		this.$msg = document.querySelector('#h5player-msg');
		this.$player_ctrl = document.querySelector('#h5player-ctrl');
		this.$time_progress = document.querySelector('#h5player-time-progress');
		this.$loadline = document.querySelector('#h5player-loadline');
		this.$timeline = document.querySelector('#h5player-timeline');
		this.$play_btn = document.querySelector('#h5player-play-btn');
		this.$current_time = document.querySelector('#h5player-time-current');
		this.$total_time = document.querySelector('#h5player-time-total');
		this.$volume_btn = document.querySelector('#h5player-volume-btn');
		this.$volume_progress = document.querySelector('#h5player-volume-progress');
		this.$volumeline = document.querySelector('#h5player-volumeline');
		this.$full_btn = document.querySelector('#h5player-full-btn');
	};
	//绑定video
	Player.prototype.bindVideo = function(id){
		var $video = document.querySelector(id);
		var src = $video.getAttribute('src');
		//比较src和innerHTML
		if(src === null){//video src不存在
			if(this.$video.getAttribute('src') !== null){//当前video src存在则移除该属性，重新加载
				this.$video.removeAttribute('src');
				this.load();
			}
		}else if(src !== this.$video.getAttribute('src')){
			this.$video.setAttribute('src',src);
			this.load();
		}
		if($video.innerHTML != this.$video.innerHTML){
			this.$video.innerHTML = $video.innerHTML;
			this.load();
		}
	};
	//显示播放器
	Player.prototype.showPlayer = function(id){
		this.$player_bg.style.display = 'block';
		this.isShow = true;
		this.bindVideo(id);
		if(this.$video.paused){
			this.$video.play();
		}
	};
	//获取时间移动占进度条的比例
	Player.prototype.getTimeRadio = function(e){
		return (e.pageX - this.$player.offsetLeft - this.$time_progress.offsetLeft + 8)/this.$time_progress.offsetWidth;
	};
	//获取音量移动占进度条的比例
	Player.prototype.getVolumeRadio = function(e){
		return (e.pageX - this.$player.offsetLeft - this.$volume_progress.offsetLeft + 6)/this.$volume_progress.offsetWidth;
	};
	//获取本地对象数据存储
	Player.prototype.getObjectLocal = function(key){
		var local;
		if(window.localStorage){
			local = localStorage[key];
		}else{
			local = this.getCookie(key);
		}
		if(local){
			try{
				local = JSON.parse(local);
			}catch(err){
				local = null;
			}
		}else{
			local = null;
		}
		return local;
	};
	//设置本地对象数据存储
	Player.prototype.setObjectLocal = function(key, value){
		if(!window.localStorage){
			try{
				this.setCookie(key,JSON.stringify(value));
			}catch(err){
				this.setCookie(key,null);
			}
			return;
		}
		try{
			localStorage[key] = JSON.stringify(value);
		}catch(err){
			localStorage[key] = null;
		}
	};
	Player.prototype.setCookie = function (c_name, value) {
		var exdate = new Date();
		var opt = {
			path: "/",
			expiredays: "",
			domain: ""
		};
		var oCookie = "";
		oCookie += c_name + "=" + value;
		oCookie += ";path=" + opt.path;
		exdate.setDate(exdate.getDate + opt.expiredays);
		oCookie += ";expires=" + exdate.toGMTString();
		document.cookie = oCookie;
	};
	Player.prototype.getCookie = function (c_name) {
		if (typeof c_name === 'undefined') {
			var a = document.cookie.split(";");
			if (a[0] !== "") {
				var o = {};
				for (var i = 0; i < a.length; i++) {
					var v = a[i].split("=");
					o[v[0]] = unescape(v[1]);
				}
				return o;
			}
			return null;
		} else {
			if (document.cookie.length > 0) {
				c_start = document.cookie.indexOf(c_name + "=");
				if (c_start != -1) {
					c_start = c_start + c_name.length + 1;
					c_end = document.cookie.indexOf(";", c_start);
					if (c_end == -1) c_end = document.cookie.length;
					return unescape(document.cookie.substring(c_start, c_end));
				}
			}
			return null;
		}
	};
	//全屏
	Player.prototype.launchFullscreen = function (element) {
		if(element.requestFullscreen) {
			element.requestFullscreen();
		}else if(element.webkitRequestFullscreen) {
			element.webkitRequestFullscreen();
		}else if(element.msRequestFullscreen) {
			element.msRequestFullscreen();
		}else if(element.mozRequestFullScreen) {
			element.mozRequestFullScreen();
		}
	};
	// 退出全屏
	Player.prototype.exitFullscreen = function () {
		if(document.exitFullscreen) {
			document.exitFullscreen();
		}else if(document.webkitExitFullscreen) {
			document.webkitExitFullscreen();
		}else if(document.msCancelFullScreen) {
			document.msCancelFullScreen();
		}else if(document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		}
	};
	//时间转换
	Player.prototype.timeFormat = function (time) {
		time = parseInt(time,10);
		var hours   = Math.floor(time / 3600);
		var minutes = Math.floor((time - (hours * 3600)) / 60);
		var seconds = time - (hours * 3600) - (minutes * 60);
		if (hours   < 10) {hours   = "0"+hours;}
		if (minutes < 10) {minutes = "0"+minutes;}
		if (seconds < 10) {seconds = "0"+seconds;}
		return hours+':'+minutes+':'+seconds;
	};
	//触发事件
	Player.prototype.trigger = function (element,event) {
		var _event = document.createEvent("HTMLEvents");
		_event.initEvent(event,false,false);
		element.dispatchEvent(_event);
	};
	//单例播放器
	var singlePlayer;

	function play(id){
		if( singlePlayer === undefined ){
			singlePlayer = new Player();
			singlePlayer.init(id);
		}else{
			singlePlayer.showPlayer(id);
		}
	}
	return {
		play: play
	};
})();