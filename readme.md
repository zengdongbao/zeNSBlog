****
title:这是个神奇的网站
tag:zeNSBlog
****

###这个项目叫zeNSBlog

一个个人的实验性项目，灵感来源于 [farbox](www.farbox.com)。

学习Node.js的过程，苦于找不到一个具体的项目来驱动实践，于是本着不折腾会死的精神以及重复造轮子的光荣传统，于是**zeNSBlog**便有了出现的理由。

``zeNSBlog``，全称就是*一个zen的人做的非常 simple的blog*，当然只看大写部分也是可以的，任何NB的人或事都会经历一段SB的过程。这是真理，你可以拿笔记下来~

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





