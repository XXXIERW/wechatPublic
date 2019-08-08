const sha1 = require('sha1')
const getRawBody = require('raw-body')
const util = require('./util')
module.exports = (config, reply) => { // 参数是从入口函数(app.js)传入的
  return async (ctx, next) => {
    const { signature, timestamp, nonce, echostr } = ctx.query
    const token = config.token
    const str = [token, timestamp, nonce].sort().join('')
    const sha = sha1(str)
    if (ctx.method === 'GET') {
      if (sha === signature) {
        ctx.body = echostr
      } else {
        ctx.body = 'sha appear wrong!!!'
      }
    } else if (ctx.method === 'POST') {
      if (sha !== signature) {
        return (ctx.body = 'POST appear wrong')
      }
      // 对拿到的数据进行筛选,防止恶意消息占据数据库
      const data = await getRawBody(ctx.req, {
        length: ctx.length,
        limit: '1mb',
        encoding: ctx.charset
      })

      const content = await util.parseXML(data)// 对data数据进行解析
      console.log(content)
      const message = util.formatMessage(content.xml)// 格式化一个消息
      console.log(message)
      ctx.weixin = message
      await reply.apply(ctx, [ctx, next])// 传过去(reply.js)的ctx,next进行动态修改

      const replyBody = ctx.body
      const msg = ctx.weixin
      const xml = util.tpl(replyBody, msg)
      ctx.status = 200
      ctx.type = 'application/xml'
      ctx.body = xml
    }
  }
}
