export type SavedCustomMsgItemType = {
  id: string;//伪随机唯一id
  created_at: string;//创建时间
  updated_at: string;//上次更新时间
  title?: string;//标题
  data: string;//发送的字符串数据
  enable: boolean;//是否有效,目前仅对重复定时器有效（用于开启/关闭自动发送消息）
  interval: number;//setInterval定时器时间参数，0为不开启定时器
}

export type CustomMsgItemCreateType = Omit<SavedCustomMsgItemType, 'created_at' | 'updated_at' | 'id'>

export type CustomMsgUpdateType = 'update' | 'create' | 'remove'
