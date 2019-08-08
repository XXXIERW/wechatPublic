
const mongoose = require('mongoose')

const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId// 拿到ObjectId

const CategorySchema = new Schema({ // 创建一个实例;
  name: {
    unique: true,
    type: String
  }, // 分类名称
  movies: [{
    type: ObjectId,
    ref: 'Movie'
  }],
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
CategorySchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updateAt = Date.now()
  } else {
    this.meta.updateAt = Date.now()
  }

  next()
})

mongoose.model('Category', CategorySchema)
