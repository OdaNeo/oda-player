//变量声明
//鼠标悬停事件
export let autohide = {
  diff: 3000, //时间间隔
  first_time: new Date().getTime(),
  last_time: new Date().getTime(),
  timer: null
}
// 定义鼠标悬停事件
export const mouseP = (mousemove, mousepause, el) => {
  mousemove(el)
  clearInterval(autohide.timer)
  autohide.first_time = new Date().getTime()
  autohide.timer = setInterval(() => {
    autohide.last_time = new Date().getTime()
    if (autohide.last_time - autohide.first_time > autohide.diff) {
      mousepause(el)
      clearInterval(autohide.timer)
    }
  }, 10)
}
