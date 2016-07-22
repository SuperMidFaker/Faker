Welogix SaaS Web前端与Render服务
===================
技术栈参考
=====
  * [[https://webpack.github.io|Webpack]]
  * [[https://babeljs.io/|Babel]]
  * [[https://babeljs.io/docs/learn-es2015/|ES6]] [[https://hacks.mozilla.org/category/es6-in-depth/|es6 in depth]] [[https://babeljs.algolia.com/docs/usage/experimental/|ES7 supported by Babel 5]](现在用到包括es7.decorators, es7.objectRestSpread, es7.classProperties)
  * [[https://facebook.github.io/react/|React]] [[https://facebook.github.io/react/docs/tutorial.html|入门tutorial]]
  * [[http://redux.js.org/|Redux]]  [[https://github.com/rackt/redux/tree/master/examples|Redux库内可学习例子]]
  * [[https://github.com/rackt/react-router|React-Router]]
  * 国内的文章
    - https://blog.coding.net/blog/React-server-rendering
    - [[https://github.com/my-fe/wiki/issues/1|百度母婴商场webapp React实践]]

主目录说明
=====
  * client        //前端代码目录
  * common        //前后端共用的一些代码
  * config        //项目相关的所有的配置文件目录
  * pm2           //pm2 的目录
  * public        //公共一些js、css等之类资源文件
  * scripts       //编译时使用
  * server        //服务端接口、数据访问之类的代码
  * tests         //测试代码
  * webpack       //webpack相关的一些代码

------------------------------------

client
======
  * common        //前端公共的代码
  * components    //前端公共的组件代码
  * containers    //前端应用相关的代码(按照模块目录具体细分，尽量保持独立)  暂定
  * util          //前端工具类代码


------------------------------------

common
======
  * reducers      //redux的reducer目录

------------------------------------

config
======
  * keys         //授权用的jwt rsa keys

------------------------------------

server
======
  * api          //功能性接口目录
  * middlewares  //koa的中间件
  * openapi      //开放接口目录
  * routes       //路由相关的代码
  * util         //server端使用的工具类
