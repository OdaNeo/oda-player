# 自定义播放器@0.2 版本

### 简介

1. 使用 webpack 打包的原生 js 播放器
2. 左键点击/空格实现播放、暂停；播放结束自动暂停，再次点击重新播放
3. 5 秒内如果无法获取到视频源(networkState=0||networkState=3||readyState=0)，则判定为视频无法播放
4. 可以查看播放进度条和缓冲进度条
5. 4 种播放速率可选，点击右下角可以全屏/退出全屏播放
6. 点击左方向键和右方向键可以快进快退 5s，并且在视频播放进度为 0 和 1 时不触发
7. 播放进度/音量/播放速率保存在**localStorage**中
8. 全屏播放时，鼠标静止 3 秒即可隐藏鼠标、隐藏底部控制条，晃动/点击鼠标即可显示
9. 原生 js 实现鼠标悬停事件触发以及派发
10. 所有图标均为 svg 格式，并实现 svg 图标 **morphing** 动画
11. 组件化：音量/播放进度条/缓冲进度条均为 **Range** 组件实例化而来，暴露出 set 和 get 两个方法，方便读取和写入数据
12. 扩大播放进度条、按钮、音量进度条、按钮的点击判定范围，从 10px 到 16px 不等
13. 底部控制条配色参考 youtube
14. 可以设定触发视频加载的事件(src 懒加载)，也可以修改为其他事件

### 配置选项

1. demo

```
el = new Video({
     el: el,
     url: url,
     width: 900,
     height: 450,
     event: event,
   })
```

2. el: Video 的实例化对象
3. url: 视频地址链接
4. width: 视频宽度，默认 900px
5. height: 视频高度，默认 450px
6. event: 触发视频加载的事件，事件需要挂载在 **window** 上面，默认事件是 **window.load**

### 备注

1. Video 元素事件触发顺序 **loadstart/loadedmetadata/loadeddata/canplay**
2. 如果视频源懒加载，那么**timeupdate**事件会立刻触发一次，早于**loadstart**
3. 舍弃了旧的 keyCode 属性，用 code 取代
4. video 事件处理参考了 **qier-plyer** https://github.com/vortesnail/qier-player
5. 如果存在缓存，缓存进度条 buffered 有时不显示：是因为 timeupdate 事件在视频暂停时不触发，应改为 progress
6. 视频缓存的时候 readyState=0||1||2

### 待添加特性

1. 右键显示视频信息
2. 更好看的 cover 层
3. 媒体加载失败时，触发重新加载事件 Load()
4. 视频元数据加载时显示进度条
5. 更多的配置选项
