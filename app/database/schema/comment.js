// 1.Schema Comment 设计
// 2.实现 Controller
// 3.增加对应的路由
// 4.增加评论表单以及展现评论列表

const mongoose = require('mongoose')

const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId// 拿到ObjectId

const CommentSchema = new Schema({ // 创建一个实例;
// 对哪部电影进行评论,利用objectId找到对应的电影（哪部电影、评论人、评论内容、对评论进行回复）

  // 哪部电影，通过Object来拿到
  movie: {
    type: ObjectId,
    ref: 'Movie'
  },
  // 评论人
  from: {
    type: ObjectId,
    ref: 'User'
  },
  // 评论内容
  content: String,

  // 对哪条评论进行回复
  replies: [{
    // 回复人
    from: {
      type: ObjectId,
      ref: 'User'
    },
    // 对谁进行回复
    to: {
      type: ObjectId,
      ref: 'User'
    },
    // 内容
    content: String
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

// (时间初始化)每一次数据调用都要使用到这个,利用创建一个中间件的方法
CommentSchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updateAt = Date.now()
  } else {
    this.meta.updateAt = Date.now()
  }

  next()
})

mongoose.model('Comment', CommentSchema)
