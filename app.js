const Koa = require('koa')
const Router = require('koa-router')
const session = require('koa-session')
const serve = require('koa-static')
const bodyParser = require('koa-bodyparser')
const moment = require('moment')
const mongoose = require('mongoose')
const { resolve } = require('path')
const config = require('./config/config')
const { initSchemas, connect } = require('./app/database/init')

  // 1)首先加载中间件
  // 2)ctx koa中应用上下文,ctx里面有request,respone等功能
  // 3)next串联中间件的钩子函数
  // 4)app.use将外层传入微信的配置信息给middleware里面的config
  // 5)这样子引用起到了模块、配置消息等复用功能

;(async () => {
// 连接并且初始化数据库
  await connect(config.db)// 初始化数据库地址

  initSchemas()

  // 生成服务器实例koa框架必备,利用app去调用各个函数
  const app = new Koa()
  const router = new Router()

  var views = require('koa-views')

  // Must be used before any router is used
  app.use(views(resolve(__dirname, 'app/views'), {
    extension: 'pug',
    options: {
      moment: moment
    }
  }))

  app.keys = ['xxxierw']
  app.use(session(app))
  app.use(bodyParser())// 调用中间件
  app.use(serve(resolve(__dirname, '../public')))// 提供中间件图片或者资源的访问;

  // 植入两个中间件，做前置的微信环境检查，跳转，回调用户数据存储和状态同步
  const wechatController = require('./app/controllers/wechat')

  app.use(wechatController.checkWechat)
  app.use(wechatController.wechatRedirect)

  app.use(async (ctx, next) => { // 动态传输网站数据
    const User = mongoose.model('User')// 通过mongoose里面的madel拿到数据
    let user = ctx.session.user
    if (user && user._id) { // 判断用户是否存在,id是否存在
      user = await User.findOne({ _id: user._id })

      if (user) {
        ctx.session.user = { // 返回数据库里面的session数据
          _id: user._id,
          role: user.role,
          nickname: user.nickname
        }

        ctx.state = Object.assign(ctx.state, {
          user: {
            _id: user._id,
            nickname: user.nickname
          }

        })
      }
    } else {
      ctx.session.user = null// 没有用户传回来的消息
    }

    await next()
  })

  // 接入微信消息中间件
  require('./config/routes')(router)

  // 让路由中间件生效
  app
    .use(router.routes())
    .use(router.allowedMethods())

  app.listen(1234)
  console.log('listen: ' + 1234)
})()
