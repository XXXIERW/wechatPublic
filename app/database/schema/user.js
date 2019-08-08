const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const SALT_WORK_FACTOR = 10 // 加密权重
const MAX_LOGIN_ATTEMPTS = 5 // 最多允许尝试的次数
const LOCK_TIME = 10 * 60 * 1000 // 锁定的时间 10分钟

const Schema = mongoose.Schema

const UserSchema = new Schema({
  // 角色定义:(user、 admin、 superAdmin)
  role: {
    type: String,
    default: 'user'
  },
  openid: [String], // 兼容各个微信应用，小程序/公众号
  unionid: String,
  nickname: String,
  address: String,
  province: String,
  country: String,
  city: String,
  gender: String,
  email: {
    unique: true, // 避免数据重复
    type: String
  },
  password: String,
  // 保存加验后的密码值
  // hashed_password: String,
  // 登录的次数限制
  loginAttempts: {
    type: Number,
    required: true,
    default: 0
  },
  lockUntil: Number, // meta的功能是用来记录
  meta: {
    createdAt: {
      type: Date,
      default: Date.now()
    },
    updatedAt: {
      type: Date,
      default: Date.now()
    }
  }
})

// 虚拟字段,不会传入数据库
UserSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now())
})

// 中间件
UserSchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updateAt = Date.now()
  } else {
    this.meta.updateAt = Date.now()
  }

  next()
})

// 判断用户的密码
UserSchema.pre('save', function (next) {
  const user = this

  if (!user.isModified('password')) return next()

  bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) return next(err)
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err)

      user.password = hash// 更新用户密码
      next()
    })
  })
})

// 比对密码,第一个用户传过来的密码,第二个存在数据库里面加密过的密码
// 静态方法
UserSchema.methods = {
  comparePassword: function (_password, password) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(_password, password, function (err, isMatch) {
        if (!err) resolve(isMatch)
        else reject(err)
      })
    })
  },

  // 用户尝试次数更新
  incLoginAttempts: function (user) {
    const that = this
    return new Promise((resolve, reject) => {
      if (that.lockUntil && that.lockUntil < Date.now()) {
        that.updata({
          $set: {
            loginAttempts: 1
          },
          $unset: {
            lockUntil: 1
          }
        }, function (err) {
          if (!err) resolve(true)
          else reject(err)
        })
      } else {
        const updatas = {
          $inc: {
            loginAttempts: 1
          }
        }
        if (that.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS || !that.isLocked) {
          updatas.$set = {
            lockUntil: Date.now() + LOCK_TIME
          }
        }

        that.update(updatas, err => {
          if (!err) resolve(true)
          else reject(err)
        })
      }
    })
  }
}

mongoose.model('User', UserSchema)
