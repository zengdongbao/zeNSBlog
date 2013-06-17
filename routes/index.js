
var modMd = require( MOD + 'mod_md');
var async = require("async");
var md = require("node-markdown").Markdown;
require(LIB + 'lib_date');

//首页
exports.index = function(req, res){
    var start = 0;
    var len = req.app.locals.SITE.POSTS;
    getPostsList(start,len,function(data){
        res.render("index",data);
    });

};

//文章分页
exports.posts = function(req, res){
    var start = parseInt(req.query.p,10) || 0;
    if(start < 0 ){
        start = 0;
    }

    var len = req.app.locals.SITE.POSTS;
    getPostsList(start,len,function(data){
        if(data.length == 0){
            res.send(404);
        }else{
            res.render("index",data);
        }
    });
};

//文章详细页
exports.post = function(req, res){
    var url = req.param("url");
    getPostFromList(url,function(data){
        if(data.length == 0){
            res.send(404);
        }else{
            res.render("post",data);
        }
    });
};

//page详细页
exports.page = function(req, res){
    var url = req.param("url");
    getPageFromList(url,function(data){
        if(data.length == 0){
            res.send(404);
        }else{
            res.render("post",data);
        }
    });
};

//解析导航
exports.nav = function(req, res ,next){
    if(DATACACHE.navs){
        res.locals.navs = DATACACHE.navs;
        return next();
    }
    var navs={
        home:['Home',req.app.locals.SITE.URL],
        tags:['Tags',req.app.locals.SITE.TAG]
    }
    getPagesNav(function(data){
        for(var n in data){
            if(navs[n]){
                continue;
            }
            navs[n] = [];
            navs[n].push(data[n][0]);
            navs[n].push(req.app.locals.SITE.PAGE +"/"+ data[n][1]);
        }

        DATACACHE.navs = navs
        res.locals.navs = navs;
        next();
    });
};

//标签相关文章
exports.tag = function(req, res){
    var tag = req.param("tag");
    getPostsByTag(tag,function(data){
        if(data.length == 0){
            res.send(404);
        }else{
            res.render("tag",data);
        }
    });
};

//所有标签
exports.tags = function(req, res){
    getTagsList(function(data){
        res.render("tags",data);
    });
};







//从列表中取得文章
var getPostFromList = function(url,callback){
    var re = {
        post : {},
        isMatch : false
    };
    modMd.getDocumentsAll(function(err,documents){
        for(var i=0 , len = documents.length; i<len; i++){
            var post = documents[i];
            var postUrl = post.metas['url'] || post.url ;
            if(url == postUrl){
                re.isMatch = true;
                modMd.getDocumentByDir(post.file,function(err,data){
                    re.post.title = data.metas['title'] || data.title;
                    re.post.url = data.metas['url'] || data.url;
                    re.post.tags = data.metas['tags'] ? data.metas['tags'].split(",") : [];
                    re.post.mtime = data.mtime.format('cnDate');
                    re.post.body = md(data.body);
                    callback(re);
                });
                return ;
            }
        }
        return callback(re);
    });
}


//获取分页
var getPostsList = function(count,len,callback){
    var re = {
        posts:[]
    };
    modMd.getDocumentsAll(function(err,documents){
        var docs = documents.slice(count,count + len);
        re.next = count + len;
        re.prev = count - len;
        re.isNext =  (count + len < documents.length);
        re.isPrev = (count > 0);
        modMd.getDocumentsByQuery(docs,function(){
            callback(re);
        },function(post){
            var data = {};
            data.title = post.metas['title'] || post.title;
            data.url = post.metas['url'] || post.url;
            data.tags = post.metas['tags'] ? post.metas['tags'].split(",") : [];
            data.mtime = post.mtime.format('cnDate');
            data.summary = md(post.summary);
            re.posts.push(data);
        });

    });
}

//获取page页面链接
var getPagesNav = function(callback){
    var re = {};
    modMd.getPagesAll(function(err,pages){
        for(var i=0 , len = pages.length; i<len; i++){
            var page = pages[i];
            var name = page.metas['name'] || page.title;
            var url = page.metas['url'] || page.url;
            re[name]=[name,url];
        }
        return callback(re);

    });
}


//从列表中取得page页
var getPageFromList = function(url,callback){
    var re = {
        post : {},
        isMatch : false
    };
    modMd.getPagesAll(function(err,pages){
        for(var i=0 , len = pages.length; i<len; i++){
            var page = pages[i];
            var pageUrl = page.metas['url'] || page.url ;
            if(url == pageUrl){
                re.isMatch = true;
                modMd.getDocumentByDir(page.file,function(err,data){
                    re.post.title = data.metas['title'] || data.title;
                    re.post.url = data.metas['url'] || data.url;
                    re.post.tags = data.metas['tags'] ? data.metas['tags'].split(",") : [];
                    re.post.mtime = data.mtime.format('cnDate');
                    re.post.body = md(data.body);
                    callback(re);
                });
                return ;
            }
        }
        return callback(re);
    });
}


//获取标签列表
var getTagsList = function(callback){
    var re = {
        title:"标签"
    }
    modMd.getTagsAll(function(err,tags){
        re.tags = tags;
        callback(re);
    });
}

//获取标签的文章列表
var getPostsByTag = function(tag,callback){
    var re = {
        tag:tag,
        posts:{}
    };
    modMd.getDocumentsByTag(tag,function(err,posts){
        posts.forEach(function(post){
            var year = post.mtime.getFullYear();
            if(!re.posts[year]){
                re.posts[year] = [];
            }
            var data = {};
            data.title = post.metas['title'] || post.title;
            data.url = post.metas['url'] || post.url;
            data.mtime = post.mtime.format('mmdd');
            re.posts[year].push(data);
        });
        callback(re);
    });
}