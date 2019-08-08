const mongoose = require('mongoose')
const User = mongoose.model('User')
// 1.实现一个注册页面的控制 showSignup
exports.showSignup = async (ctx, next) => {
  await ctx.render('pages/signup', {
    title: '注册页面'
  })
}
// 2.增加登录页面的控制 showSignin
exports.showSignin = async (ctx, next) => {
  await ctx.render('pages/signin', {
    title: '登录页面'
  })
}
// 3.用户数据的持久化 signup
exports.signup = async (ctx, next) => {
  const {
    email,
    password,
    nickname
  } = ctx.request.body.user

  console.log(email, password, nickname)
  let user = await User.findOne({ email })// 判断用户是否已经存在

  if (user) return ctx.redirect('/signin')

  // 用户不存在的时候
  user = new User({
    email,
    nickname,
    password
  })

  // 增加数据持久化
  ctx.session.user = { // sessin下面的字段定义,不然后面拿不到
    _id: user._id,
    role: user.role,
    nickname: user.nickname
  }

  user = await user.save()

  ctx.redirect('/')// 返回到首页
}

// 4.增加一个登录的校验/判断 signin
exports.signin = async (ctx, next) => {
  const { email, password } = ctx.request.body.user
  const user = await User.findOne({ email })

  if (!user) return ctx.redirect('/user/signup')
  const isMath = await user.comparePassword(password, user.password)

  if (isMath) {
    ctx.session.user = {
      _id: user._id,
      role: user.role,
      nickname: user.nickname
    }

    ctx.redirect('/')
  } else {
    ctx.redirect('/user/signin')
  }
}

exports.logout = async (ctx, next) => {
  ctx.session.user = {}

  ctx.redirect('/')// 返回到首页
}
// 5.增加路由规则
// 6.增加两个PUG页面，注册和登录
// 7.koa-bodyparser

// 拿到用户列表
exports.list = async (ctx, next) => {
  const users = await User.find({}).sort('meta.updatedAt')

  // 渲染用户列表页面
  await ctx.render('pages/userList', {
    title: '用户列表页面',
    users
  })
}

// 判断用户是否登录的路由中间件
exports.signinRequired = async (ctx, next) => {
  const user = ctx.session.user
  console.log(user)
  if (!user || !user._id) {
    return ctx.redirect('/user/signin')
  }
  await next()
}

// 判断用户是否是管理员身份

exports.adminRequired = async (ctx, next) => {
  const user = ctx.session.user

  if (user.role !== 'admin') {
    return ctx.redirect('/user/signin')
  }

  await next()
}

// 删除
exports.del = async (ctx, next) => {
  const id = ctx.query.id
  try {
    await User.remove({ _id: id })
    ctx.body = { success: true }
  } catch (err) {
    ctx.body = { success: false }
  }
}
