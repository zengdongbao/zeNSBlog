/**
 * @fileOverview MD文件处理
 */


var fs = require("fs");
var path = require("path");
var crypto = require('crypto');
var lineReader = require('line-reader');
var async = require("async");


var dataPath = DATA;
var matchExt = ".md";




var Documents = {};

/**
 * @description 获得所有文件列表
 * TODO:以文件夹为分类，多级文件夹解析
 * @param {Function} cb 回调函数
 */
Documents.getDocumentsAll = function(cb){
    //用全局变量做缓存
    if(DATACACHE.all){
        return cb(null,DATACACHE.all);
    }
    var datas=[];
    try{
        var documents = fs.readdirSync(dataPath);
        var options = {model:'list'};

        async.eachSeries(
            documents,
            function (item,callback) {
                var dir = dataPath + item;
                parseFileData(dir,options,function(err,data){
                    if(data.state){
                        datas.push(data);
                    }
                    callback();
                });
            },
            function (err) {
                if(err){
                    return cb(err,datas);
                }
                //按创建时间排序
                async.sortBy(datas, function(file, callback){
                    callback(err, file.mtime);
                }, function(err, results){
                    //写入缓存
                    DATACACHE.all = results.reverse();
                    cb(null,DATACACHE.all);
                });
            }
        );
    }catch (e){
        cb(e,datas);
    }
};
/**
 * @description 获得部分文件列表，内容包括摘要。
 * @param {Aarry} arr 要读取的列表对象
 * @param {Function} cb 回调函数
 */
Documents.getDocumentsByQuery = function(arr,cb,singleCb){

//    var arrFile =  [];
//    arr.forEach(function(n){
//        arrFile.push(n);
//    })
//    var index = crypto.createHash('md5').update(arrFile.join("")).digest('hex');
//    //检查缓存
//    if(DATACACHE[index]){
//        return cb(null,DATACACHE[index]);
//    }


    var datas=[];
    try{
        var options = {model:'summary'};
        async.eachSeries(
            arr,
            function (item,callback) {
                var dir = item.file;
                var cacheIndex = crypto.createHash('md5').update(dir).digest('hex');
                var cache = DATACACHE.docs[cacheIndex] || DATACACHE.summary[cacheIndex];
                if(cache){
                    datas.push(cache);
                    //对每条数据的操作
                    singleCb && singleCb(cache);
                    callback();
                }else{
                    parseFileData(dir,options,function(err,data){
                        if(data.state){
                            DATACACHE.summary[cacheIndex] = data;
                            datas.push(data);
                            singleCb && singleCb(data);
                        }
                        callback();
                    });
                }

            },
            function (err) {
                if(!err){
                    //写入缓存
//                    DATACACHE[index] = datas;
                }

                cb(err,datas);
            }
        );
    }catch (e){
        cb(e,datas);
    }
};

/**
 * @description 获得某篇文章的所有信息
 * @param {Object} obj 要读取的列表对象
 * @param {Function} cb 回调函数
 */
Documents.getDocumentByDir = function(dir,cb){
    var index = crypto.createHash('md5').update(dir).digest('hex');
    //检查缓存
    if(DATACACHE.docs[index]){
        return cb(null,DATACACHE.docs[index]);
    }
    var options = {model:'all'};
    parseFileData(dir,options,function(err,data){
        if(!err){
            //写入缓存
            DATACACHE.docs[index] = data;
            //读取全文后，从缓存中对应的摘要信息，回收内容
            if(DATACACHE.summary[index]){
                delete DATACACHE.summary[index];
            }
        }
        cb(err,data);
    });
};




/**
 * @description 获取所有page类型文档
 * @param {Function} cb 回调函数
 */
Documents.getPagesAll = function(cb){
    //用全局变量做缓存
    if(DATACACHE.pages){
        return cb(null,DATACACHE.pages);
    }
    var datas=[];
    try{
        var pagesPath = path.join(dataPath,"pages");
        if(!fs.existsSync(pagesPath)){
            //没有pages目录，直接返回空数组
            return cb(null,datas);
        }

        var pages = fs.readdirSync(pagesPath);
        async.eachSeries(
            pages,
            function (item,callback) {
                var dir = path.join(pagesPath,item);
                parseFileData(dir,function(err,data){
                    if(data.state){
                        datas.push(data);
                    }
                    callback();
                });
            },
            function (err) {
                if(err){
                    return cb(err,datas);
                }
                //按创建时间排序
                async.sortBy(datas, function(file, callback){
                    callback(err, file.mtime);
                }, function(err, results){
                    //写入缓存
                    DATACACHE.pages = results.reverse();
                    cb(null,DATACACHE.pages);
                });
            }
        );
    }catch (e){
        cb(e,datas);
    }
};


/**
 * @description 获取所有TAG
 * @param {Function} cb 回调函数
 */
Documents.getTagsAll = function(cb){
    //用全局变量做缓存
    if(DATACACHE.tags){
        return cb(null,DATACACHE.tags);
    }
    var datas = {};

    var documents = fs.readdirSync(dataPath);
    var options = {model:'meta'};

    async.eachSeries(
        documents,
        function (item,callback) {
            var dir = dataPath + item;
            parseFileData(dir,options,function(err,data){

                if(data.state && data.metas["tags"]){
                    var tags = data.metas["tags"].split(",");
                    for(var i = 0, len=tags.length ; i<len; i++){
                        var tag = tags[i];
                        if(!datas[tag]){
                            datas[tag] = [];
                        }
                        datas[tag].push(data);
                    }

                }
                callback();
            });
        },
        function (err) {
            if(err){
                return cb(err,datas);
            }
            DATACACHE.tags = datas;
            cb(null,datas);
        }
    );

};


/**
 * @description 根据tag获得文章列表
 * @param {Object} obj 要读取的列表对象
 * @param {Function} cb 回调函数
 */
Documents.getDocumentsByTag = function(tag,cb){
    var datas = [];
    this.getTagsAll(function(err,tags){
        if(tags[tag]){
            datas = tags[tag];
        }
        cb(err,datas);
    });

};


/**
 * @description 清除文章缓存
 */
Documents.cleanCache = function(){
    var arg = arguments.length
    if(arg == 0){
        DATACACHE = {
            docs : {},
            tags : {},
            summary : {}
        }
    }else if(arg == 1){
        delete DATACACHE[arg[0]];
    }else{
        delete DATACACHE[arg[0]][arg[1]];
    }
}


module.exports = Documents;


/**
 * @description 解析MD文档内容
 * @param {String} dir 解析文件路径
 * @param {Object} [options] 解析的相关设置
 * @param options.model 解析类型 all:全文 summary:摘要 meta:属性  list:文件信息
 * @return {Object} re 作为一个对象返回。
 */
function parseFileData(dir,options,callback){
    var re = {
        state : 0,          //状态
        file : dir,         //文件名
        type : 'public',    //文档的私密性 public：公开  private：私人
        summary : '',       //摘要
        body : '',          //正文
        metas: {},          //文档自定义属性，其中的type，tags，url，title会覆盖文档的源属性
        msg : ''            //返回信息
    };
    if(arguments.length == 2){
        callback = options;
        options={
            model:'all'
        }
    }

    //检测文件后缀
    if(path.extname(dir) !== matchExt){
        re.msg = '无效文件';
        callback(null,re);
        return ;
    }

    try{
        var stat = fs.statSync(dir);
        if(!stat.isFile()){
            re.msg = '无效文件';
            callback(null,re);
            return ;
        }



        //获取文件的创建时间
        re.ctime = stat.ctime;
        re.atime = stat.atime;
        re.mtime = stat.mtime;
        re.size  = stat.size;

        //获取文件名作为标题
        var title = path.basename(dir,matchExt);
        re.title = title;
        re.url = re.mtime.getTime();
        re.state = 1;
        if(options.model == "list"){
            re.msg = "文件信息解析完成！";
            callback(null,re);
            return ;
        }


        var metaRegex = /(\b[a-z]+[\w\u0391-\uFFE5]*)\s*:\s*(.*)/i;
        var metaRangRegex = /[\*]{4,}/;
        var moreRegex = /^<!--\s*more\s*-->\s*$/;
        var isMetaOverview = false;
        var hadMoreOverview = false;
        var lines = 0;
        var content = [];



        lineReader.eachLine(dir, function(line, last) {
            //计算行数
            lines++;

            //第一行符合四个*号条件则开始解析meta
            if(lines == 1 && metaRangRegex.test(line)){
                isMetaOverview = true;
                return ;
            }
            //非第一行符合四个*号条件则结束解析meta
            if(lines > 1 && metaRangRegex.test(line) && isMetaOverview){
                isMetaOverview = false;
                //meta模式下则退出执行回调
                if(options.model == "meta"){
                    re.msg = "meta信息解析完成！";
                    callback(null,re);
                    return false;
                }
                return ;
            }
            //解析meta状态下
            if(isMetaOverview){
                var match = line.match(metaRegex);
                if(match && match.length>0){
                    re.metas[match[1]] = match[2];
                }
            }else{

                if(moreRegex.test(line)){
                    hadMoreOverview = true;
                    re.summary = content.join("\n");
                    if(options.model == "summary"){
                        re.msg = "摘要信息解析完成！";
                        callback(null,re);
                        return false;
                    }
                    return ;
                }else{
                    content.push(line);
                }


            }

            if(last){
                re.msg = '全文解析完成！';
                re.body = content.join("\n");
                if(!hadMoreOverview){
                    re.summary = re.body;
                }
                callback(null,re);
                return false;
            }
        });
    }catch(e){
        console.log(e);
        re.msg = '系统错误';
        callback(e,re);
        return ;
    }


}






/**
 * @description
 * 作废，留着做纪念
 * 将字符串解析成对象
 * @param {String} str 要解析的内容
 */
var convertString = function(str){
    var re={
        meta:{}
    };
    var metasRegExp =  /-{4}([\w\W]*?)-{4}/i;
    var metas = '(\\w*?)\s*?:\s*?(\\w*?)';
    var moreRegExp = /([\w\W]*?)<!--\s*more\s*-->([\w\W]*?)/i;

    var metasMatch = str.match(metasRegExp);
    if(metasMatch){
        var matchs = metasMatch[0].match(new RegExp(metas,"ig"));
        if(matchs){
            matchs.forEach(function(n){
                var match = n.match(new RegExp(metas,"i"));
                if(match){
                    re.meta[match[1]] = match[2];
                }
            });
        }
    }
    //去掉摘要
    str = str.replace(metasRegExp,"");
    var contentMatch = str.match(moreRegExp);
    if(contentMatch){
        re.summary = contentMatch[1];
        re.body = contentMatch[1] + contentMatch[2];
    }else{
        re.body = str;
    }


}



/**
 * @description
 * 作废，留着做纪念
 * 按需获取文件内容，直到匹配指定的条件 （针对大文件，避免一次性加载造成的内存浪费）
 * 未完成，在read过程中会遇到中文字符隔断造成乱码的问题。
 * 已使用line-reader代替该功能。
 * @param {String} file 要解析的文件
 * @param {RegExp} regex 匹配条件
 * @param {Function} callback 回调方法
 */
var readFileByKeyword = function(file,regex,callback){
    var re="";
    //每次读取的最长字节数
    var maxLenth = 4;
    var offset = 0;
    var position = 0;

    var stat = fs.statSync(file);
    var fileSize = stat.size;

    var len =  maxLenth < (fileSize - position) ? maxLenth : (fileSize - position);
    var buf = new Buffer(len);

    var _readSync = function(fd){
        fs.read(fd,buf,offset,len,position,function(err,byteRead,buffer){
            if(err){
                //发生错误，返回错误信息与已加载内容
                callback(err,re);
                return ;
            }

            re += buffer;
            var str = re.toString('utf-8');
            var arr = str.split('\n');
            var matchs = str.match(regex);
            if(matchs){
                //命中，返回正则匹配内容
                callback(null,matchs);
            }else if(position + byteRead >= fileSize){
                //无命中，全文加载完毕，返回全文
                callback(null,re.toString());
            }else{
                //无命中，继续加载
                position += len;
                len = maxLenth < (fileSize - position) ? maxLenth : (fileSize - position);
                buf = new Buffer(len);
                _readSync(fd);
            }
        })
    }
    try{
        _readSync(fs.openSync(file,'r'));
    }catch (e){
        //发生错误，返回错误信息与已加载内容
        callback(e,re);
        return;
    }

}



