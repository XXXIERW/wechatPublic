const { resolve } = require('path')
const isProd = process.NODE_ENV === 'production'

let cfg = {
  port: 1234,
  db: 'mongodb://localhost/xxxierw',

  wechat: {
    appID: 'wxb84f1479a4b06e38',
    appSecret: 'dbdf8fa49fdbe85d0e78dfb6f8ec82ff',
    token: 'xxxierw'
  },
  baseUrl: 'http://xxxierw.4kb.cn/'
}

if (isProd) {
  const config = require(resolve(__dirname, '../../../config/config.json'))
  
  cfg = Object.assign(cfg, config)
}

module.exports = cfg