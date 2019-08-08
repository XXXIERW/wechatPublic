const { reply } = require('../../wechat/reply')
const config = require('../../config/config')
const wechatMiddle = require('../../wechat-lib/middleware')
const api = require('../api/index')

// 异步实现网页签名
exports.getSDKSignature = async (ctx, next) => {
  let url = ctx.query.url

  url = decodeURIComponent(url)

  const params = await api.wechat.getSignature(url)

  ctx.body = {
    success: true,
    data: params
  }
}

exports.sdk = async (ctx, next) => {
  const url = ctx.href
  const params = await api.wechat.getSignature(url)

  await ctx.render('wechat/sdk', params)
}
// 接入微信消息中间件
exports.hear = async (ctx, next) => {
  const middle = wechatMiddle(config.wechat, reply)

  await middle(ctx, next)
}

exports.oauth = async (ctx, next) => {
  const target = config.baseUrl + 'userinfo'
  const scope = 'snsapi_userinfo'
  const state = ctx.query.id
  const url = api.wechat.getAuthorizeURL(target, scope, state)

  ctx.redirect(url)
}

exports.userinfo = async (ctx, next) => {
  const userData = await api.wechat.getUserinfoByCode(ctx.query.code)

  ctx.body = userData
}

// 检查请求是不是get请求，是的话才会去做处理，不是的话直接向下
// 是的话，检查有没有code，有向下处理，没有的话检查是不是来自微信的请求
// ua是微信的用户头 user-agent

function isWechat (ua) {
  if (ua.indexOf('MicroMessenger') >= 0) {
    return true
  } else {
    return false
  }
}

exports.checkWechat = async (ctx, next) => {
  const ua = ctx.headers['user-agent']
  const code = ctx.query.code

  // 所有的网页请求都会经过这个中间件，包括网页访问
  // 针对POST非GET请求不走这个中间件
  if (ctx.method === 'GET') {
    // 如果参数带CODE说明已经授权
    if (code) {
      await next()
      // 如果没有 CODE并且微信访问,就可以配置授权跳转
    } else if (isWechat(ua)) {
      const target = ctx.href
      const scope = 'snsapi_userinfo'
      const url = api.wechat.getAuthorizeURL(scope, target, 'fromWechat')// 生成一个url

      ctx.redirect(url)
    } else {
      await next()
    }
  } else {
    await next()
  }
}

// 用户授权后进入的中间件
exports.wechatRedirect = async (ctx, next) => {
  const { code, state } = ctx.query

  if (code && state === 'fromWechat') {
    const userData = await api.wechat.getUserinfoByCode(code)
    const user = await api.wechat.saveWechatUser(userData)

    ctx.session.user = {
      _id: user._id,
      role: user.role,
      nickname: user.nickname
    }

    // 把用信息态同步到pug模板引擎
    ctx.state = Object.assign(ctx.state, {
      user: {
        _id: user._id,
        role: user.role,
        nickname: user.nickname
      }
    })
  }
  await next()
}
