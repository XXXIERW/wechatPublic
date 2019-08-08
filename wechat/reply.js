const { resolve } = require('path')
const commonMenu = require('./menu')
const config = require('../config/config')
const api = require('../app/api/index')

const help = '终于等到你，还好我没放弃/:rose/:rose欢迎关注，<a href="' + config.baseUrl + ' ">软件资源管理</a>/:rose/:rose\n' +
  '回复  1-3，测试文字回复\n' +
  '回复  4，测试图片回复\n' +
  '回复  首页，进入软件资源首页\n' +
  '回复  资源名字，查询需求信息\n' +
  '1.<a href="' + config.baseUrl + '/movie/search ">点击帮助</a>，获取更多帮助信息\n' +
  '2.<a href="' + config.baseUrl + '/movie/search ">点击资源详细</a>，获取我们目前资源内容，直接回复首页可以进入我们官方首页\n' +
  '3.可以直接回复语音进行内容查询，也可以点击<a href="' + config.baseUrl + '/movie/search ">语音查询资源</a>，查询资源信息\n' +
  'PS:\n' +
  '   某些功能以及软件或者视频是我们没有的，请点击<a href="' + config.baseUrl + '/movie/search ">联系客服</a>，进行反馈我们会用最快的速度进行处理\n'

exports.reply = async (ctx, next) => {
  const message = ctx.weixin // 从middleware里面拿到信息

  const mp = require('./index')
  const client = mp.getWechat()
  console.log(message)

  if (message.MsgType === 'voice') {
    const str = message.Recognition
    const content = str.replace('。', '')
    console.log(content)
    let reply = ''
    let movies = await api.movie.searchByKeyword(content)
    reply = []

    if (!movies || movies.length === 0) {
      const catData = await api.movie.findMoviesByCat(content)
      console.log(catData)
      if (catData) {
        movies = catData.movies
      }
    }
    if (!movies || movies.length) {
      movies = movies.slice(0, 4)

      movies.forEach(movie => {
        reply.push({
          title: movie.title,
          description: movie.summary,
          picUrl: movie.poster.indexOf('http') > -1 ? movie.poster : (config.baseUrl + '/upload/' + movie.poster),
          url: config.baseUrl + '/movie/' + movie._id
        })
      })
    } else {
      reply = '   很抱歉，没有查询到与 ' + content + ' 相关的资源，有可能是因为名字的描述错误导致。\n' + '例如:（ 把ps改成photoshop尝试一下哦！）\n' + 'PS:\n' + '   如果还是出现问题，<a href="' + config.baseUrl + '/movie/search ">请点击联系客服</a>，反馈给客服，我们会尽快与你联系的哦！'
    }
    ctx.body = reply
  } if (message.MsgType === 'image') {
    console.log(message.PicUrl)
  } if (message.MsgType === 'event') {
    let reply = ''

    if (message.Event === 'subscribe') {
      reply = help
    } else if (message.Event === 'unsubscribe') {
      reply = '愿你归来之时仍是少年'
    } else if (message.Event === 'SCAN') {
      reply = '关注后扫二维码' + '扫码参数' + message.EventKey + '_' + message.ticket
    } else if (message.Event === 'LOCATION') {
      reply = `地址更新为: ${message.Latitude}-${message.Longtude}-${message.Precision}`
    } else if (message.Event === 'CLICK') {
      if (message.EventKey === 'help') {
        reply = help
      // 根据数据库来拿到请求内容
      } else if (message.EventKey === 'movie_hot') {
        const movies = await api.movie.findHotMovies(-1, 4)
        reply = []

        movies.forEach(movie => {
          reply.push({
            title: movie.title,
            description: movie.summary,
            picUrl: 'https://dcdn.it120.cc/2019/08/07/8e5a8b82-4f31-4ef3-b213-f7d0f3ee0a97.jpg',
            url: config.baseUrl + '/movie/' + movie._id
          })
        })
      } else if (message.EventKey === 'movie_cold') {
        const movies = await api.movie.findHotMovies(1, 4)
        reply = []
        // 需求定义方法在api里面实现
        movies.forEach(movie => {
          reply.push({
            title: movie.title,
            description: movie.summary,
            picUrl: 'https://dcdn.it120.cc/2019/08/07/8e5a8b82-4f31-4ef3-b213-f7d0f3ee0a97.jpg',
            url: config.baseUrl + '/movie/' + movie._id
          })
        })
      } else if (message.EventKey === 'know_zhihu') {
        // 分类查询功能实现
        const catData = await api.movie.findMoviesByCat('知乎')
        const movies = catData.movies || []
        reply = []

        movies.forEach(movie => {
          reply.push({
            title: movie.title,
            description: movie.summary,
            picUrl: 'https://dcdn.it120.cc/2019/08/07/8e5a8b82-4f31-4ef3-b213-f7d0f3ee0a97.jpg',
            url: config.baseUrl + '/movie/' + movie._id
          })
        })
      } else if (message.EventKey === 'know_tenxun') {
      // 分类查询功能实现
        const catData = await api.movie.findMoviesByCat('腾讯课堂')
        const movies = catData.movies || []
        reply = []

        movies.forEach(movie => {
          reply.push({
            title: movie.title,
            description: movie.summary,
            picUrl: 'https://dcdn.it120.cc/2019/08/07/8e5a8b82-4f31-4ef3-b213-f7d0f3ee0a97.jpg',
            url: config.baseUrl + '/movie/' + movie._id
          })
        })
      }
    } else if (message.Event === 'VIEW') {
      reply = '你点击了菜单链接: ' + message.EventKey + '' + message.MenuID
    } else if (message.Event === 'scancode_push') {
      reply = '扫码推送事件: ' + message.ScanCodeInfo.ScanType + '' + message.ScanCodeInfo.ScanResult
    } else if (message.Event === 'scancode_waitmsg') {
      reply = '扫码推送带提示事件: ' + message.ScanCodeInfo.ScanType + '' + message.ScanCodeInfo.ScanResult
    } else if (message.Event === 'pic_sysphoto') {
      reply = '系统拍照事件推送: ' + message.SendPicsInfo.Count + '' + JSON.stringify(message.SendPicsInfo.PicList)
    } else if (message.Event === 'pic_photo_or_album') {
      reply = '拍照或者相册选取图片: ' + message.SendPicsInfo.Count + '' + JSON.stringify(message.SendPicsInfo.PicList)
    } else if (message.Event === 'pic_weixin') {
      reply = '微信相册: ' + message.SendPicsInfo.Count + '' + JSON.stringify(message.SendPicsInfo.PicList)
    } else if (message.Event === 'location_select') {
      reply = '你选择的地理位置是: ' + JSON.stringify(message.SendLocationInfo)
    }

    ctx.body = reply
  } else if (message.MsgType === 'text') {
    const content = message.Content
    let reply = 'Oh,No!你回复的消息: ' + content + '太复杂了,请点击联系客服咨询哦！'

    if (content === '最右') {
      const countData = await api.wechat.saveMPUser(message, '最右')
      const user = countData.user
      const count = countData.count
      let nickname = user.nickname || ''
      if (user.gender === '1') {
        nickname = `小哥哥过来关注我咯/:rose 你好/:circle${nickname}小哥哥/::$`
      } else if (user.gender === '2') {
        nickname = `小姐姐也来咯！/:handclap 你好/:circle${nickname}小姐姐/::$`
      }
      let guess = '我猜不出来你来自哪里，'

      if (user.province || user.city) {
        guess = `我猜你来自${user.province}省🏪${user.city}市🕌的沙雕家人`
      }
      const end = `${guess}沙雕家人们，你们别害怕，这些信息只有你关注我了以后，我才能从微信那里偷偷拿到的哦我都精心加密然后偷偷藏在心里的哦/::,@`
      reply = `嘻嘻嘻，来自最右的${nickname}已经有${count}个来自最右大家庭的沙雕右友关注我了/:rose/:rose/:rose${end}`
    } else if (content === '1') {
      reply = 'Test Reply Content One'
    } else if (content === '2') {
      reply = 'Test Reply Content Two'
    } else if (content === '3') {
      reply = 'Test Reply Content Thirty'
    } else if (content === '4') {
     	const data = await client.handle('uploadMaterial', 'image', resolve(__dirname, '../2.jpg'))
	    reply = {
	    	type: 'image',
	    	mediaId: data.media_id
	    }
    } else if (content === '5') {
      const data = await client.handle('uploadMaterial', 'video', resolve(__dirname, '../6.mp4'))

      reply = {
        type: 'video',
        title: '回复的视频标题',
        description: '打个篮球玩玩',
        mediaId: data.media_id
      }
    } else if (content === '6') {
      const data = await client.handle('uploadMaterial', 'video', resolve(__dirname, '../6.mp4'), {
        type: 'video',
        description: '{"title": "这个地方很棒", "introduction": "好吃不如饺子"}'
      })

      reply = {
        type: 'video',
        title: '回复的视频标题 2',
        description: '打个篮球玩玩',
        mediaId: data.media_id
      }
    } else if (content === '7') {
      const data = await client.handle('uploadMaterial', 'image', resolve(__dirname, '../2.jpg'), {
        type: 'image'
      })

      reply = {
        type: 'image',
        mediaId: data.media_id
      }
    } else if (content === '8') {
      const data = await client.handle('uploadMaterial', 'image', resolve(__dirname, '../2.jpg'), {
        type: 'image'
      })
      const data2 = await client.handle('uploadMaterial', 'pic', resolve(__dirname, '../2.jpg'), {
        type: 'image'
      })
      console.log(data2)

      const media = {
        articles: [
          {
            title: '这是服务端上传的图文 1',
            thumb_media_id: data.media_id,
            author: 'Scott',
            digest: '没有摘要',
            show_cover_pic: 1,
            content: '点击去往慕课网',
            content_source_url: 'http://coding.imooc.com/'
          }, {
            title: '这是服务端上传的图文 2',
            thumb_media_id: data.media_id,
            author: 'Scott',
            digest: '没有摘要',
            show_cover_pic: 1,
            content: '点击去往 github',
            content_source_url: 'http://github.com/'
          }
        ]
      }

      const uploadData = await client.handle('uploadMaterial', 'news', media, {})

      const newMedia = {
        media_id: uploadData.media_id,
        index: 0,
        articles: {
          title: '这是服务端上传的图文 1',
          thumb_media_id: data.media_id,
          author: 'Scott',
          digest: '没有摘要',
          show_cover_pic: 1,
          content: '点击去往慕课网',
          content_source_url: 'http://coding.imooc.com/'
        }
      }

      console.log(uploadData)

      const mediaData = await client.handle('updateMaterial', uploadData.media_id, newMedia)

      console.log(mediaData)

      const newsData = await client.handle('fetchMaterial', uploadData.media_id, 'news', true)
      const items = newsData.news_item
      const news = []

      items.forEach(item => {
        news.push({
          title: item.title,
          description: item.description,
          picUrl: data2.url,
          url: item.url
        })
      })

      reply = news
    } else if (content === '9') {
      const counts = await client.handle('countMaterial')
      console.log(JSON.stringify(counts))

      const res = await Promise.all([
        client.handle('batchMaterial', {
          type: 'image',
          offset: 0,
          count: 10
        }),
        client.handle('batchMaterial', {
          type: 'video',
          offset: 0,
          count: 10
        }),
        client.handle('batchMaterial', {
          type: 'voice',
          offset: 0,
          count: 10
        }),
        client.handle('batchMaterial', {
          type: 'news',
          offset: 0,
          count: 10
        })
      ])

      console.log(res)

      reply = `
        image: ${res[0].total_count}
        video: ${res[1].total_count}
        voice: ${res[2].total_count}
        news: ${res[3].total_count}
      `
    } else if (content === '10') {
      // 创建标签
      // let newTag = await client.handle('createTag', 'imooc')
      // console.log(newTag)
      // 删除标签
      // await client.handle('delTag', 100)
      // 编辑标签
      // await client.handle('updateTag', 101, '慕课网')
      // 批量打标签/取消标签
      await client.handle('batchTag', [message.FromUserName], 101, true)
      // 获取某个标签的用户列表
      const userList = await client.handle('fetchTagUsers', 2)
      console.log(userList)
      // 获取公众号的标签列表
      const tagsData = await client.handle('fetchTags')
      // 获取某个用户的标签列表
      // let userTags = await client.handle('getUserTags', message.FromUserName)

      reply = tagsData.tags.length
    } else if (content === '11') {
      const userList = await client.handle('fetchUserList')

      console.log(userList)

      reply = userList.total + ' 个关注者'
    } else if (content === '12') {
      await client.handle('remarkUser', message.FromUserName, 'ScottScott')
      reply = '改名成功'
    } else if (content === '13') {
      const userInfoData = await client.handle('getUserInfo', message.FromUserName)

      console.log(userInfoData)

      reply = JSON.stringify(userInfoData)
    } else if (content === '14') {
      const batchUsersInfo = await client.handle('fetchBatchUsers', [{
        openid: message.FromUserName,
        lang: 'zh_CN'
      }, {
        openid: 'oMd3_50kM2ANo6imK84NWZFdFtKg',
        lang: 'zh_CN'
      }])

      console.log(batchUsersInfo)

      reply = JSON.stringify(batchUsersInfo)
    } else if (content === '获取临时推广二维码') {
    	const tempQrData = {
	        expire_seconds: 1209600, // 二维码有效期两周时间
	        action_name: 'QR_SCENE',
	        action_info: {
		        scene: {
		          scene_id: 101
		        }
		   	}
	    }
	    const tempTicketData = await client.handle('createQrcode', tempQrData)
	        console.log(tempTicketData)
      const tempQr = client.showQrcode(tempTicketData.ticket)
        	console.log(tempQr)

      reply = tempQr
    } else if (content === '获取永久推广二维码') {
    	const qrData = {
	        action_name: 'QR_SCENE',
	        action_info: {
		        scene: {
		            scene_id: 99
		        }
	        }
	    }
	    const ticketData = await client.handle('createQrcode', qrData)
	    console.log(ticketData)
	    const qr = client.showQrcode(ticketData.ticket)
	    console.log(qr)

    	reply = qr
    } else if (content === '15') {
    	const longurl = 'https://mp.weixin.qq.com/debug/cgi-bin/sandboxinfo?action=showinfo&t=sandbox/index'
    	const shortData = await client.handle('createShortUrl', 'long2short', longurl)
    	console.log(shortData)

    	reply = shortData.short_url
    } else if (content === '16') {
    	const semanticData = {
    		query: '查一下明天从厦门到北京的南航机票',
        city: '厦门',
        category: 'flight,hotel',
        uid: message.FromUserName
    	}
    	const searchData = await client.handle('semantic', semanticData)

    	console.log(searchData)

    	reply = JSON.stringify(searchData)
    } else if (content === '17') {
    	const body = '努力努力在努力，奋斗奋斗在奋斗'
    	const aiData = await client.handle('aiTranslate', body, 'zh_CN', 'en_US')
    	console.log(aiData)

    	reply = JSON.stringify(aiData)
    } else if (content === '18') {
      try {
        const delMenu = await client.handle('delMenu')
    	console.log(delMenu)
    	const menu = {
    		button: [
	    		{
	    			name: '一级菜单',
	    			sub_button: [
	    				{
	    					name: '二级子菜单1',
	    					type: 'click',
	    					key: 'no_1'
	    				}, {
	    					name: '二级子菜单2',
	    					type: 'click',
	    					key: 'no_2'
	    				}, {
	    					name: '二级子菜单3',
	    					type: 'click',
	    					key: 'no_3'
	    				}, {
	    					name: '二级子菜单4',
	    					type: 'click',
	    					key: 'no_4'
	    				}, {
	    					name: '二级子菜单5',
	    					type: 'click',
	    					key: 'no_5'
	    				}

	    			]
	    		},
	    		{
	    			name: '分类',
	    			type: 'view',
	    			url: 'https://github.com'
	    		},
	    		{
	    			// 动态菜单
	    			name: '新菜单_ ' + Math.random(),
	    			type: 'click',
	    			key: 'Dynamic_menu'
	    		}
    	    ]
    	}
    	await client.handle('createMenu', menu)
      } catch (e) {
    	console.log(e)
      }

    	reply = 'CREATE MENU SUCCESSFULLY!! REFOCUS YOU CAN SEE!!'
    } else if (content === '19') {
      try {
        let delData = await client.handle('delMenu')
    	   console.log(deleData)
      const menu = {
    		button: [
	    		{
	    			name: '菜单1',
	    			sub_button: [
	    				{
	    					name: '系统拍照',
	    					type: 'pic_sysphoto',
	    					key: 'rselfmenu_1_0'
	    				}, {
	    					name: '拍照或者相册发图',
	    					type: 'pic_photo_or_album',
	    					key: 'rselfmenu_1_1'
	    				}, {
	    					name: '微信相册发图',
	    					type: 'pic_weixin',
	    					key: 'rselfmenu_1_2'
	    				}, {
	    					name: '扫码推事件',
	    					type: 'scancode_push',
	    					key: 'rselfmenu_0_1'
	    				}, {
	    					name: '扫码带提示',
	    					type: 'scancode_waitmsg',
	    					key: 'rselfmenu_0_0'
	    				}

	    			]
	    		},
	    		{
	    			name: 'test',
	    			type: 'view',
	    			url: 'https://github.com'
	    		},
	    		{
	    			// 动态菜单
	    			name: '其他 ',
	    			sub_button: [
	    				{
	    					name: '上报地理位置',
	    					type: 'location_select',
	    					key: 'no_1'
	    				}, {
	    					name: '点击菜单',
	    					type: 'click',
	    					key: 'no_2'
	    				}

	    			]
	    		}]
    	}
    	 const data = await client.handle('createMenu', menu)
        console.log(data)
      } catch (e) {
    	console.log(e)
      }

    	let menus = await client.handle('fetchMenu')
    	  console.log(JSON.stringify(menus))

    	reply = 'CREATE MENU SUCCESSFULLY!! REFOCUS YOU CAN SEE!!'
    } else if (content === '更新菜单') {
      try {
        await client.handle('delMenu')
        await client.handle('createMenu', commonMenu)
      } catch (e) {
        console.log(e)
      }

      reply = '菜单创建成功，请等 5 分钟，或者先取消关注，再重新关注就可以看到新菜单'
    } else if (content === '首页') {
      reply = [{
        title: '软件资源管理',
        description: '似水年华,与你相伴',
        picUrl: 'https://dcdn.it120.cc/2019/08/07/8e5a8b82-4f31-4ef3-b213-f7d0f3ee0a97.jpg',
        url: config.baseUrl
      }]
    } else {
      let movies = await api.movie.searchByKeyword(content)
      reply = []
      if (!movies || movies.length === 0) {
        const catData = await api.movie.findMoviesByCat(content)

        if (catData) {
          movies = catData.movies
        }
      }
      if (!movies || movies.length) {
        movies = movies.slice(0, 4)
        movies.forEach(movie => {
          reply.push({
            title: movie.title,
            description: movie.summary,
            picUrl: movie.poster.indexOf('http') > -1 ? movie.poster : (config.baseUrl + '/upload/' + movie.poster),
            url: config.baseUrl + '/movie/' + movie._id
          })
        })
      } else {
        reply = '   很抱歉，没有查询到与 ' + content + ' 相关的资源，有可能是因为名字的描述错误导致。\n' + '例如:（ 把ps改成photoshop尝试一下哦！）\n' + 'PS:\n' + '   如果还是出现问题，<a href="' + config.baseUrl + '/movie/search ">请点击联系客服</a>，反馈给客服，我们会尽快与你联系的哦！'
      }
    }
    ctx.body = reply
  }
}
