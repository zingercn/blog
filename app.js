var express = require('express');
var mongoose = require('mongoose');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var cookieParser = require('cookie-parser');
var multer  = require('multer');
var moment = require('moment');
var path = require('path');
var fs = require('fs');
var port = process.env.PORT || 80;

var app = express();
var dbUrl = 'mongodb://localhost/blog';
mongoose.connect(dbUrl);

// 设置页面和模板
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// 设置静态目录
app.use(express.static(path.join(__dirname, 'public')));
// 设置 bodyParser
app.use(bodyParser.urlencoded({extended: true}));
// 日期处理
app.locals.moment = moment;
// 设置cookie 和session
app.use(cookieParser());
app.use(session({
	secret: 'blog',
	name: 'blog.sid',
	resave: false,
	saveUninitialized: false,
	store: new MongoStore({
		url: dbUrl,
		autoReconnect: true,
		collection: 'sessions'
	})
}));
// 设置 文件上传中间件
app.use(multer({
	dest: './public/upload',
	rename: function (fieldname, filename) {
		return moment(Date.now()).format('YYYY-MM-DD_Hmmss');
	},
	changeDest: function(dest, req, res){
		var stat = null;
		dest = path.join(dest, moment(Date.now()).format('YYYYMM'));
		try {
			stat = fs.statSync(dest);
		} catch(err) {
			fs.mkdirSync(dest);
		}

		return dest;
	}
}));
// 开发提示
if ('development' === app.get('env')) {
	// app.set('showStackError', true);
	// app.use(morgan(':method :url :status'));
	// app.locals.pretty = true;
	// mongoose.set('debug', true);
}

// 加载路由
require('./config/routes')(app);

app.listen(port);
console.log('site start on ' + port);
