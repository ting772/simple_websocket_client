# simple_websocket_client

一个简单的与websocket通信的gui客户端，方便websocket相关开发调试。

## 功能

- [x] 连接输入的websocket服务器url并保存，方便下次直接使用
- [x] 手动发送消息至websocket服务器
- [x] 定时器持续自动发送文本消息到websocket服务器，如心跳信息
- [x] 定义与url相关联的自定义消息并保存，方便下次连接时自动执行任务
- [x] 展示服务端发送的文本消息，支持正则表达式过滤
- [ ] 断线时，自动重新连接尝试

## 说明

项目electron-builder配置目前只配置了winows nsis的打包方式，其它平台的暂不支持。如需调整，请拉取代码重新调整打包配置然后打包。

