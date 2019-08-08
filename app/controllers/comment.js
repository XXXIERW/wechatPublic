// 增加评论的方法
const mongoose = require('mongoose')
const Comment = mongoose.model('Comment')

exports.save = async (ctx, netx) => {
  const commentData = ctx.request.body.comment

  if (commentData.cid) { // cid为对谁评论的id
    const comment = await Comment.findOne({
      _id: commentData.cid// 拿到cid
    })

    const reply = {
      from: commentData.from,
      to: commentData.tid,
      content: commentData.content
    }

    comment.replies.push(reply)// 添加回复内容

    await comment.save()

    ctx.body = { success: true }// 返回成功的消息
  } else {
    const comment = new Comment({ // 创建一个新的评论
      movie: commentData.movie,
      from: commentData.from,
      content: commentData.content
    })

    await comment.save()

    ctx.body = { success: true }
  }
}
