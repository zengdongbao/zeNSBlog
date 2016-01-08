

###这个项目叫zeNSBlog

一个个人的实验性项目，灵感来源于 [farbox](www.farbox.com)。


<!-- more -->




###安装与配置
这个系统基于``node.js``驱动，使用``markdown``文件作为存储。无数据库，无依赖其他支撑服务。  

* 项目托管：[github](https://github.com/zengdongbao/zeNSBlog)
* 运行环境：node.js 0.8+
* 当前版本：0.0.1


**下载代码**

```
git clone https://github.com/zengdongbao/zeNSBlog
```

**安装依赖**

```
npm install
```

**基本配置**

```
vim config.json
```

```
{
    "SITE":{
        "NAME" : "ZEN",						//站点名称
        "URL" : "http://127.0.0.1:3000",   //网站地址
        "STATIC" : "/static",			    //静态文件目录
        "POST" : "/post",                      
        "TAG" : "/tag",
        "PAGE" : "/page",
        "POSTS" : 3                        //列表一页显示文章数
    }
}
```

**发布内容**

把``.md``格式的文件放到``/public/data/``目录下即可


**启动服务**

```
node app
```





