export default Object.freeze({
  customMsgIntervalStep: 1000,//自定义消息interval参数必须是他的n倍(n=0,1,2...)
  idlingMaxCount: 10,//jobrunner定时器最大空转次数，超过后则销毁jobrunner定时器
})
