const mongoose = require('mongoose')
// 0.电影分类的model创建
const Category = mongoose.model('Category')
const Movie = mongoose.model('Movie')
const api = require('../api')

// 1.电影分类的录入页面
exports.show = async (ctx, next) => {
  const { _id } = ctx.params
  let category = {}
  if (_id) {
    category = await api.movie.findCategoryById(_id)
  }
  await ctx.render('pages/category_admin', {
    title: '后台分类录入页面',
    category
  })
}
// 2.电影分类的创建持久化
exports.new = async (ctx, next) => {
  // 可以从后台拿到数据,在schame里面定义了数据的存储以及提取
  const { name, _id } = ctx.request.body.category
  let category
  // 判断ID是否已经存在,避免重复出现录入情况
  if (_id) {
    category = await api.movie.findCategoryById(_id)
  }
  if (category) {
    category.name = name
  } else {
    category = new Category({ name })
  }

  await category.save()

  ctx.redirect('/admin/category/list')
}
// 3.电影分类的后台列表(查询)
exports.list = async (ctx, next) => {
  // 可以从后台拿到数据,在schame里面定义了数据的存储以及提取
  const categories = await api.movie.findCategories()

  await ctx.render('pages/category_list', {
    title: '分类列表页面',
    categories
  })
}

// 4.对应的分类路由规则

// 5.对应的分类页面

// 删除
exports.del = async (ctx, next) => {
  const id = ctx.query.id

  try {
    await Category.remove({ _id: id })
    await Movie.remove({
      category: id // 只要是分类的这个id就直接都删除
    })
    ctx.body = { success: true }
  } catch (err) {
    ctx.body = { success: false }
  }
}
