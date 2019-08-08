
const mongoose = require('mongoose')

const Schema = mongoose.Schema

const TicketSchema = new Schema({ // 创建一个实例;
  name: String,
  ticket: String,
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
TicketSchema.pre('save', function (next) {
  if (this.isNew) {
    this.meta.createdAt = this.meta.updateAt = Date.now()
  } else {
    this.meta.updateAt = Date.now()
  }

  next()
})

TicketSchema.statics = {
  async getTicket () {
    const ticket = await this.findOne({
      name: 'ticket'
    })

    if (ticket && ticket.ticket) {
      ticket.ticket = ticket.ticket
    }

    return ticket
  },

  async saveTicket (data) {
    let ticket = await this.findOne({
      name: 'ticket'
    })

    if (ticket) {
      ticket.ticket = data.ticket // 拿到外部传进来的token
      ticket.expires_in = data.expires_in
    } else {
      ticket = new Ticket({
        name: 'ticket',
        ticket: data.ticket,
        expires_in: data.expires_in
      })
    }

    await ticket.save()

    return data
  }
}

const Ticket = mongoose.model('Ticket', TicketSchema)
