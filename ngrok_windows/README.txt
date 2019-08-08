默认运行start.bat就行了。
如果想固定一个域名的话
修改start.bat为以下内容
ngrok -config ngrok.cfg -subdomain 自定义名称 8080
访问的时候输入：自定义名称.ngrok.4kb.cn 即可。

命令最后的8080代表你本机的端口。是其他端口就填其他的就OK。