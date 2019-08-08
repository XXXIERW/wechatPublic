// oauth是微信的一种授权方式
const request = require('request')

const base = 'https://api.weixin.qq.com/sns/'
const api = {
  authorize: 'https://open.weixin.qq.com/connect/oauth2/authorize?',
  accessToken: base + 'oauth2/access_token?',
  userInfo: base + 'userinfo?'
}

module.exports = class WechatOAuth {// 使用异步请求
  constructor (opts) {
    this.appID = opts.appID
    this.appSecret = opts.appSecret
  }

  async request (options) {
    // 重新定义
    options = Object.assign({}, options, { json: true })

    try {
      const res = await request(options)

      return res
    } catch (err) {
      console.log(err)
    }
  }

  // 详细信息/主动授权: snsapi_userinfo
  // 基本信息/静默授权: snsapi_base
  // 定义一个方法用来拼装一个二跳地址
  getAuthorizeURL (scope = 'snsapi_base', target, state) {
    const url = `${api.authorize}appid=${this.appID}&redirect_uri=${encodeURIComponent(target)}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`

    return url
  }

  // 通过上面可以拿到code,code--->access_token, openID
  async fetchAccessToken (code) {
    const url = `${api.accessToken}appid=${this.appID}&secret=${this.appSecret}&code=${code}&grant_type=authorization_code`

    // 发起一个同步请求,拿到token, openIF
    const res = await this.request({ url })
    return res
  }

  // 拿到用户的详细信息
  async getUserInfo (token, openID, lang = 'zh_CN') {
    const url = `${api.userInfo}access_token=${token}&openid=${openID}&lang=${lang}`
    const res = await this.request({ url })

    return res
  }
}
