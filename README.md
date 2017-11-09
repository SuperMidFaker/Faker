Welogix SaaS Web前端与Render服务
===================
技术栈
=====
  * [Webpack](https://webpack.github.io): 模块打包工具
  * [Babel](https://babeljs.io/) [ES6](https://babeljs.io/docs/learn-es2015/) [es6 in depth](https://hacks.mozilla.org/category/es6-in-depth/)
  * [ES7 supported by Babel 5(现在用到包括es7.decorators, es7.objectRestSpread, es7.classProperty)](https://babeljs.algolia.com/docs/usage/experimental/)
  * [React](https://facebook.github.io/react/) [tutorial](https://facebook.github.io/react/docs/tutorial.html)
  * [Redux](http://redux.js.org/)  [例子](https://github.com/rackt/redux/tree/master/examples)
  * [React-Router](https://github.com/rackt/react-router)
  * [Eslint](http://eslint.cn/) [Rules](https://github.com/airbnb/javascript): 代码规范
  * 国内的文章
    - https://blog.coding.net/blog/React-server-rendering
    - [百度母婴商场webapp React实践](https://github.com/my-fe/wiki/issues/1)

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
  * apps    //前端应用相关的代码(按照模块目录具体细分，尽量保持独立)  暂定
  * admin   // 平台管理功能
  * util          //前端工具类代码


------------------------------------

common
======
  * reducers      //redux的reducer目录

------------------------------------

server
======
  * routes       //路由相关的代码

开发说明
====

## SASS主站点
  ```
    npm i
    npm run hot
    npm run dev
  ```

## ADMIN站点
  ```
    npm run admin-hot
    npm run admin-dev
  ```

## 全局变量
  * API_ROOTS: API地址列表,在reducer内通过origin属性指定
      'self': 访问当前域名
      'default': api.welogix.cn
      'mongo': api1.welogix.cn

## API服务

  git clone git@git.welogix.cn:saas/welogix-api-mysql.git

## 多语言国际化

  * [react-intl](https://github.com/yahoo/react-intl)) defineMessages定义对应文本的描述键(descriptor key), 全局唯一id和defaultMessage,示例见message.i18n.js文件
  * react-intl的injectIntl装饰翻译组件, client/common/i18n/helpers.js的format关联定义的message和组件
  * intl对应的message格式见[官方文档](http://formatjs.io/guides/message-syntax/)

## Caveats

  * 使用HTTP-only cookie保存用户授权token, 因此要求API域名必须为welogix.cn下面的子域名
  * API服务与站点Web服务端口必须固定, Saas: 3022, ADMIN:3024, api-mysql: 3030, openapi-mysql: 3031, api-mongo: 3032
  * 只有顶层Route可用connect-fetch在服务端获取数据,其他地方装饰均只有在客户端加载
  * connectNav/withPrivilege需要通过connect props变化调用componentWillReceiveProps,故要求置于connect内

## TODO
  test istanbul-cov
  connect-nav willreceive may fire multiple
  webpack-dev-middleware + server
  router async lazy load
  webpack build time reduce
  remove server babel-register import reducers require babel
  env test hmr locals[0] error
