const mongoose = require('mongoose')
const Category = mongoose.model('Category')
const Movie = mongoose.model('Movie')

/*
//通过豆瓣api来查找，但是目前与我做的不匹配(服务器对服务器的请求)
exports.searchByDouban = async(q) => {

} */

// 按照分类寻找内容
exports.findMoviesByCat = async (cat) => {
  const data = await Category.findOne({
    name: cat || cat + '。'
  }).populate({
    path: 'movies',
    select: 'id title poster summary'
  })
  return data
}

// 根据pv寻找内容
exports.findHotMovies = async (hot) => {
  const data = await Movie.find({}).sort({
    pv: hot
  }).limit(4)

  return data
}

// 按照分类ID去搜索
exports.searchByCategory = async (catId) => {
  const data = await Category.find({
    _id: catId
  }).populate({
    path: 'movies',
    select: '_id title poster',
    options: { limit: 8 }
  })

  return data
}

// 按照关键词去搜索
exports.searchByKeyword = async (q) => {
  const data = await Movie.find({
    title: new RegExp(q + '.*', 'i')
  })

  return data
}

// 按照ID去搜索
exports.findMovieById = async (id) => {
  const data = await Movie.findOne({
    _id: id
  })

  return data
}

// 按照ID去搜索
exports.findCategoryById = async (id) => {
  const data = await Category.findOne({
    _id: id
  })

  return data
}

// 拿到所有的分类
exports.findCategories = async (id) => {
  const data = await Category.find({})

  return data
}

// 拿到详细信息
exports.findMoviesAndCategory = async (id, fields) => { // fields传入的文件
  const data = await Movie.find({}).populate('category', fields)

  return data
}
