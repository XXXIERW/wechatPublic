const mongoose = require('mongoose')

const Schema = mongoose.Schema

const TokenSchema = new Schema({ // 创建一个实例;
  name: String,
  token: String,
  expires_in: Number,

  meta: {
    createdAt: {
      type: Date,
      default: Date.now()
    },
    updateAt: {
      type: Date,
      default: Date.now()
    }
  }
})

// 每一次数据调用都要使用到这个,利用创建一个中间件的方法
TokenSchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updateAt = Date.now()
  } else {
    this.meta.updateAt = Date.now()
  }

  next()
})

TokenSchema.statics = {
  async getAccessToken () {
    const token = await this.findOne({
      name: 'access_token'
    })

    if (token && token.token) {
      token.access_token = token.token
    }

    return token
  },

  async saveAccessToken (data) {
    let token = await this.findOne({
      name: 'access_token'
    })

    if (token) {
      token.token = data.access_token // 拿到外部传进来的token
      token.expires_in = data.expires_in
    } else {
      token = new Token({
        name: 'access_token',
        token: data.access_token,
        expires_in: data.expires_in
      })
    }

    await token.save()

    return data
  }
}

const Token = mongoose.model('Token', TokenSchema)
