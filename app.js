global.BASE =  __dirname;
global.VIEW =  BASE + '/views/';
global.PUBLIC =  BASE + '/public/';
global.DATA =  PUBLIC + 'data/';
global.LIB =  BASE + '/lib/';
global.MOD =  BASE + '/model/';
/**
 * Module dependencies.
 */
var express = require('express')
    , routes = require('./routes')
    , http = require('http')
    , fs = require('fs')
    , path = require('path');

/**
 * @description 数据缓存池
 */
global.DATACACHE = {
    docs : {},          //全文文档
    //tags : {},          //标签列表
    //pages : {},         //page页面列表
    summary : {}        //摘要文档
};

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', VIEW);
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(PUBLIC));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.locals(getServerConfig());

app.get('/', routes.nav, routes.index);
app.get('/post', routes.nav, routes.posts);
app.get('/post/:url', routes.nav, routes.post);
app.get('/page/:url', routes.nav, routes.page);
app.get('/tag', routes.nav, routes.tags);
app.get('/tag/:tag', routes.nav, routes.tag);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});



//从配置文件读取数据库连接信息
function getServerConfig(){
    var serverMsg = {};
    try{
        var str = fs.readFileSync(BASE + '/config.json');
        serverMsg = JSON.parse(str);
    }catch(e){
        throw e;
    }
    return serverMsg;
}