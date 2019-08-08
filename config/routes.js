const Wechat = require('../app/controllers/wechat')
const User = require('../app/controllers/user')
const Index = require('../app/controllers/index')
const Category = require('../app/controllers/category')
const Movie = require('../app/controllers/movie')
const Comment = require('../app/controllers/comment')
const koaBody = require('koa-body')
// get请求页面,post提交数据
// 创建路由文件
module.exports = router => {
  router.get('/', Index.homePage)
  router.get('/sdk', Wechat.sdk)

  // 搜索功能的展示
  router.get('/results', Movie.search)
  // 评论功能展示
  router.post('/comment', User.signinRequired, Comment.save)
  // 电影详情页
  router.get('/movie/:_id', Movie.detail)

  // 用户注册登录路由
  router.get('/user/signup', User.showSignup)
  router.get('/user/signin', User.showSignin)
  router.post('/user/signup', User.signup)
  router.post('/user/signin', User.signin)
  router.get('/logout', User.logout)

  // 后台用户列表页面
  router.get('/admin/user/list', User.signinRequired, User.adminRequired, User.list)
  router.delete('/admin/user', User.signinRequired, User.adminRequired, User.del)

  // 后台的分类管理页面
  router.get('/admin/category', User.signinRequired, User.adminRequired, Category.show)
  router.post('/admin/category', User.signinRequired, User.adminRequired, Category.new)
  router.get('/admin/category/list', User.signinRequired, User.adminRequired, Category.list)
  router.get('/admin/category/update/:_id', User.signinRequired, User.adminRequired, Category.show)
  router.delete('/admin/category', User.signinRequired, User.adminRequired, Category.del)

  // 后台的电影管理页面
  router.get('/admin/movie', User.signinRequired, User.adminRequired, Movie.show)
  router.post('/admin/movie', User.signinRequired, User.adminRequired,
    koaBody({ multipart: true }), Movie.savePoster, Movie.new)
  router.get('/admin/movie/list', User.signinRequired, User.adminRequired, Movie.list)
  router.get('/admin/movie/update/:_id', User.signinRequired, User.adminRequired, Movie.show)
  router.delete('/admin/movie', User.signinRequired, User.adminRequired, Movie.del)

  // 异步处理网页签名
  router.get('/wechat/signature', Wechat.getSDKSignature)

  // 进入微信消息中间件
  router.get('/wx-hear', Wechat.hear)
  router.post('/wx-hear', Wechat.hear)

  // 跳动授权的中间服务页面
  router.get('/wx-oauth', Wechat.oauth)
  // 进入userInfo的回调地址(通过code获取用户信息)
  router.get('/userinfo', Wechat.userinfo)
}
