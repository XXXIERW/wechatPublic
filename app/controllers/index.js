const mongoose = require('mongoose')
const Category = mongoose.model('Category')

exports.homePage = async (ctx, next) => {
  const categories = await Category.find({}).populate({
    path: 'movies',
    select: '_id title poster', // 筛选数据显示
    options: { limit: 8 }// 限制显示数据
  })
  await ctx.render('pages/index', {
    title: '首页',
    categories
  })
}
