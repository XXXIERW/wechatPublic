module.exports = {
  button: [{
    name: '排行榜',
    sub_button: [{
      name: '最热门',
      type: 'click',
      key: 'movie_hot'
    }, {
      name: '最冷门',
      type: 'click',
      key: 'movie_cold'
    }]
  }, {
    name: '分类',
    sub_button: [{
      name: '知乎',
      type: 'click',
      key: 'know_zhihu'
    }, {
      name: '腾讯课堂',
      type: 'click',
      key: 'know_tenxun'
    }]
  }, {
    name: '帮助',
    type: 'click',
    key: 'help'
  }]
}
