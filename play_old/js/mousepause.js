//变量声明
//鼠标悬停事件
let autohide = {
  diff: 3000, //时间间隔
  first_time: new Date().getTime(),
  last_time: new Date().getTime(),
  timer: null,
};
// 定义鼠标悬停事件
const mousepause = function () {
  mousemove_user();
  clearInterval(autohide.timer);
  autohide.first_time = new Date().getTime();
  autohide.timer = setInterval(() => {
    autohide.last_time = new Date().getTime();
    if (autohide.last_time - autohide.first_time > autohide.diff) {
      mousepause_user();
      clearInterval(autohide.timer);
    }
  }, 10);
};
