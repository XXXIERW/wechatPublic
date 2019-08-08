const mongoose = require('mongoose')
const { resolve } = require('path')
const glob = require('glob')

mongoose.Promise = global.Promise

exports.initSchemas = () => {
  glob.sync(resolve(__dirname, './schema', '**/**.js'))
    .forEach(require)
}
exports.connect = (db) => {
  let maxConnectTimes = 0
  return new Promise(resolve => {
    if (process.env.NODE_ENV !== 'production') {
      mongoose.set('debug', true)
    }
    mongoose.connect(db, { useNewUrlParser: true })
    mongoose.connection.on('disconnect', () => {
      maxConnectTimes++

      if (maxConnectTimes < 5) {
        mongoose.connect(db, { useNewUrlParser: true })
      } else {
        throw new Error('MongoDB connect failed!!!,数据库挂载了吧骚年!!!')
      }
    })
    mongoose.connection.on('error', err => {
      maxConnectTimes++
      console.log(err)
      if (maxConnectTimes < 5) {
        mongoose.connect(db, { useNewUrlParser: true })
      } else {
        throw new Error('MongoDB connect failed!!!,数据库挂载了吧骚年!!!')
      }
    })
    mongoose.connection.on('open', () => {
      resolve()
      console.log('MongoDB connect success!!!')
    })
  })
}
