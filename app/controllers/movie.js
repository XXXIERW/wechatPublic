const { readFile, writeFile } = require('fs')
const { resolve } = require('path')
const mongoose = require('mongoose')
const Movie = mongoose.model('Movie')
const _ = require('lodash')
const Category = mongoose.model('Category')
const Comment = mongoose.model('Comment')
const util = require('util')
const api = require('../api')

const readFileAsync = util.promisify(readFile)
const writeFileAsync = util.promisify(writeFile)

// 0. 电影 Model 创建
// 1. 电影的录入页面
// 详情页显示电影详情

exports.detail = async (ctx, next) => {
  const _id = ctx.params._id
  const movie = await api.movie.findMovieById(_id)// 拿到movie所有的数据

  await Movie.update({ _id }, { $inc: { pv: 1 } })// 利用id值拿到pv增加值

  // 评论内容的展示
  const comments = await Comment.find({ // 查到评论内容
    movie: _id
  })
    .populate('from', '_id nickname')// 评论人的信息
    .populate('replies.from replies.to', '_id nickname')

  await ctx.render('pages/detail', {
    title: '电影详情页面',
    movie,
    comments
  })
}

exports.show = async (ctx, next) => {
  const { _id } = ctx.params
  let movie = {}

  if (_id) {
    movie = await api.movie.findMovieById(_id)
  }

  const categories = await api.movie.findCategories()// 拿到分列表所有内容

  await ctx.render('pages/movie_admin', {
    title: '后台分类录入页面',
    movie,
    categories
  })
}

exports.savePoster = async (ctx, next) => {
  const posterData = ctx.request.body.files.uploadPoster
  const filePath = posterData.path
  const fileName = posterData.name

  if (fileName) {
    const data = await readFileAsync(filePath)
    const timestamp = Date.now()// 根据时间戳区分文件
    const type = posterData.type.split('/')[1]
    const poster = timestamp + '.' + type
    const newPath = resolve(__dirname, '../../../../../', 'public/upload/' + poster)

    await writeFileAsync(newPath, data)

    ctx.poster = poster// 挂载地址
  }

  await next()
}

// 2. 电影的创建持久化
exports.new = async (ctx, next) => {
  const movieData = ctx.request.body.fields || {}
  let movie

  if (movieData._id) {
    movie = await api.movie.findMovieById(movieData._id)
  }

  if (ctx.poster) {
    movieData.poster = ctx.poster
  }

  const categoryId = movieData.categoryId// 拿到分类ID
  const categoryName = movieData.categoryName// 拿到分类昵称
  let category

  if (categoryId) {
    category = await api.movie.findCategoryById(categoryId)
  } else if (categoryName) {
    category = new Category({ name: categoryName })

    await category.save()
  }

  if (movie) {
    movie = _.extend(movie, movieData)
    movie.category = category._id
  } else {
    delete movieData._id

    movieData.category = category._id
    movie = new Movie(movieData)
  }

  category = await api.movie.findCategoryById(category._id)
  if (category) {
    category.movies = category.movies || []// 设成一个数组
    category.movies.push(movie._id)

    await category.save()
  }

  await movie.save()

  ctx.redirect('/admin/movie/list')
}

// 3. 电影的后台列表
exports.list = async (ctx, next) => {
  const movies = await api.movie.findMoviesAndCategory('name')

  await ctx.render('pages/movie_list', {
    title: '分类的列表页面',
    movies
  })
}

// 删除电影数据
exports.del = async (ctx, next) => {
  const id = ctx.query.id
  const cat = await Category.findOne({ // 查到电影的分类
    movies: {
      $in: [id]
    }
  })

  // 删除某个分类下的某个电影
  if (cat && cat.movies.length) {
    const index = cat.movies.indexOf(id)// 找到数据对应的位置
    cat.movies.splice(index, 1)
    await cat.save()
  }

  try {
    await Movie.remove({ _id: id })
    ctx.body = { success: true }
  } catch (err) {
    ctx.body = { success: false }
  }
}
// 4. 对应的分类路由规则
// 5. 对应的分类页面

// 电影搜索功能
exports.search = async (ctx, next) => {
  const { cat, q, p } = ctx.query // q,p是分页参数
  const page = parseInt(p, 10) || 0
  const count = 10
  const index = page * count

  if (cat) {
    const categories = await api.movie.searchByCategory(cat)// 通过api拿到所有的数据
    const category = categories[0]
    const movies = category.movies || []
    const results = movies.slice(index, index + count)

    await ctx.render('pages/results', {
      title: '分类搜索结果页面',
      keyword: category.name, // 关键词
      currentPage: (page + 1),
      query: 'cat=' + cat,
      totalPage: Math.ceil(movies.length / count),
      movies: results
    })
  } else {
    const movies = await api.movie.searchByKeyword(q)
    const results = movies.slice(index, index + count)
    await ctx.render('pages/results', {
      title: '关键词搜索结果页面',
      keyword: q,
      currentPage: (page + 1),
      query: 'q=' + q,
      totalPage: Math.ceil(movies.length / count),
      movies: results
    })
  }
}
