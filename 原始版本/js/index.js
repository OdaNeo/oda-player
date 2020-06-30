//--------------自定义事件------------------------------------------//
//
let event = {};
event.video_ready_to_load = new CustomEvent("video_ready_to_load");
event.video_load_failed = new CustomEvent("video_load_failed");
event.video_load_succeed = new CustomEvent("video_load_succeed");
event.video_pause = new CustomEvent("video_pause");
event.video_bad_network = new CustomEvent("bad_network");
//
// -------------函数定义---------------------------------------------//
let fn = {};
//更新视频时间的方法
fn.video_time = function (node, time) {
  let m = fn.duo_number(parseInt(time / 60)) || "--";
  let s = fn.duo_number(parseInt(time % 60)) || "--";
  node.innerHTML = `${m}:${s}`;
};
//为数字补全成两位的函数
fn.duo_number = function (num) {
  if (isNaN(num)) {
    return;
  } else {
    return (num = num < 10 ? `0${num}` : num);
  }
};
//视频可用，清除state.timer，并初始化视频播放长度，更新视频时间
fn.get_total_time = function () {
  clearTimeout(state.timer);
  state.total_time = Node.video.duration;
  fn.video_time(Node.full_time_html, state.total_time);
  fn.video_time(Node.cur_time_html, state.total_time * state.progress);
};
// 播放时
fn.play = function () {
  Node.video.play();
  anime({
    targets: Node.play_svg,
    d: "M 12,26 16,26 16,10 12,10 z M 21,26 25,26 25,10 21,10 z",
    duration: 150,
    easing: "linear",
  });
  state.is_play = true;
};
// 暂停或者播放完毕,暂停时记录播放进度
fn.pause = function () {
  Node.video.pause();
  anime({
    targets: Node.play_svg,
    d: "M 12,26 18.5,22 18.5,14 12,10 z M 18.5,22 25,18 25,18 18.5,14 z",
    duration: 150,
    easing: "linear",
  });
  state.is_play = false;
  localStorage.progress = Node.video.currentTime / state.total_time;
  localStorage.volume = Node.video.volume;
};
//判断视频是否正在播放，并且切换图标样式的函数
fn.play_toggle = function () {
  if (!state.is_play) {
    fn.play();
    return;
  } else {
    fn.pause();
    return;
  }
};
//判断音量以及是否静音，并切换样式的函数
fn.volume_toggle = function (vol = 0.5) {
  if (vol == 0) {
    anime({
      targets: Node.volume_svg,
      opacity: 1,
      duration: 200,
      easing: "linear",
    });
  } else {
    anime({
      targets: Node.volume_svg,
      opacity: 0,
      duration: 200,
      easing: "linear",
    });
  }
  localStorage.volume = vol;
  state.volume = vol;
  Node.video.volume = vol;
  volume_line_range_x.setRange(vol);
};
// 模拟视频地址懒加载
fn.set_video_src = function () {
  // 5秒后懒加载src
  setTimeout(() => {
    Node.video.src = `http://www.runoob.com/try/demo_source/mov_bbb.mp4`;
    Node.video.dispatchEvent(event.video_ready_to_load);
    // 初始加载加载视频时，延时timeout(5秒)校验视频是否存在，是否可用
    // 触发event.video_load_failed事件
    state.timer = setTimeout(() => {
      let a = Node.video.networkState;
      let b = Node.video.readyState;
      if (a === 0 || a === 3 || b === 0) {
        Node.player_cover.dispatchEvent(event.video_load_failed);
      }
    }, state.timeout);
  }, 5000);
};
// 成功给src赋值后，开始加载视频,解绑事件
fn.load_video = function () {
  window.removeEventListener("load", fn.set_video_src);
};
// 初始化视频样式(音量和播放速度)，从state中提取数据
// 在视频加载成功后, 执行init
fn.init = function () {
  //初始时为静音状态或者音量为0
  if (state.volume == 0) {
    fn.volume_toggle(0);
  } else {
    fn.volume_toggle(state.volume);
  }
  // 修正state.rate=1.0时显示错误的问题
  let a = Number(state.rate).toFixed(1);
  Node.playRate_btn_btn.innerHTML = `${a}倍速`;
  played_range_x.setRange(state.progress);
  Node.video.currentTime = state.progress * state.total_time;
};
// 视频加载成功,绑定播放暂停,按钮点击,倍速播放等事件, 初始化播放器
fn.ready_to_play = function () {
  state.can_play = true;
  Node.player_cover.innerHTML = "";
  fn.init();
  Node.play_btn.addEventListener("click", (e) => {
    e.stopPropagation();
    fn.play_toggle();
  });
  Node.video.addEventListener("click", (e) => {
    e.stopPropagation();
    fn.play_toggle();
  });
  Node.video.addEventListener("ended", () => {
    fn.pause();
    return;
  });
  document.addEventListener("keyup", (e) => {
    if (e.code !== "Space") {
      return false;
    } else {
      fn.play_toggle();
    }
  });
  // 继承Range上的get方法, 获得实时的progress
  Node.played_range_x.addEventListener("getRange", () => {
    state.progress = played_range_x.getRange();
    Node.video.currentTime = state.progress * state.total_time;
    fn.video_time(Node.cur_time_html, Node.video.currentTime);
  });
  Node.volume_line_range_x.addEventListener("getRange", () => {
    state.volume = volume_line_range_x.getRange();
    fn.volume_toggle(state.volume);
  });
  // 定义切换按钮动作
  Node.volume_btn.addEventListener("click", () => {
    if (state.volume != 0) {
      fn.volume_toggle(0);
    } else {
      fn.volume_toggle(0.5);
    }
  });
  //倍速播放(保存本地播放速度)
  for (let i = 0, len = Node.playbackrate.length; i < len; i++) {
    Node.playbackrate[i].addEventListener("click", function (e) {
      e.stopPropagation();
      let a = this.innerHTML;
      let b = this.getAttribute("value");
      let c = Node.playRate_btn_btn.innerHTML;
      if (a === c) {
        return;
      } else {
        Node.video.playbackRate = b;
        Node.playRate_btn_btn.innerHTML = a;
        localStorage.rate = b;
      }
    });
  }
};
//mousemove mousepause函数定义
function mousemove_user() {
  Node.player_control.style.opacity = "1";
  Node.player.style.cursor = "auto";
}
function mousepause_user() {
  Node.player_control.style.opacity = "0";
  Node.player.style.cursor = "none";
}
// 实例化Range组件, 包括视频播放进度条和音量条
const played_range_x = new Range(Node.played_range_x, "X");
const volume_line_range_x = new Range(Node.volume_line_range_x, "X");
//
window.addEventListener("load", fn.set_video_src);
//---------------Node.player绑定事件-----------------------------------//
Node.player.addEventListener("mouseenter", (e) => {
  e.stopPropagation();
  Node.player_control.style.opacity = "1";
});
Node.player.addEventListener("mouseleave", (e) => {
  e.stopPropagation();
  Node.player_control.style.opacity = "0";
});
//
//---------------Node.video绑定事件-------------------------------------//
// 视频可用，加载视频元数据时获取视频总时长
Node.video.addEventListener("loadedmetadata", fn.get_total_time);
// 绑定播放暂停和点击等事件,第一帧加载完
Node.video.addEventListener("loadeddata", fn.ready_to_play);
// 视频播放过程中始终触发的事件, 更新state.progress
Node.video.addEventListener("timeupdate", () => {
  if (state.can_play === false) {
    return;
  }
  state.cur_time = Node.video.currentTime;
  fn.video_time(Node.cur_time_html, state.cur_time);
  state.progress = Math.round((state.cur_time / state.total_time) * 100) / 100;
  played_range_x.setRange(state.progress);
  // 实现缓存进度条功能
  let buff = Node.video.buffered;
  let bar = Node.buffered_range_x.querySelector(".range_bar");
  if (buff.length >= 1) {
    bar.style.width = (buff.end(0) / state.total_time) * 100 + "%";
  }
});
// 加载过程中网络状况检查
Node.video.addEventListener("progress", function () {
  let rS = this.readyState;
  if (rS === 2) {
    Node.player_cover.dispatchEvent(event.video_bad_network);
  }
});
//
// -----------------document事件绑定----------------------------------------//
// 全屏隐藏底栏以及鼠标，引入mousepause鼠标悬停事件，定义mousemove_user()mousepause_user()事件
document.addEventListener("fullscreenchange", function () {
  if (document.fullscreenElement !== null) {
    Node.fullscreen_svg_0.setAttribute(
      "d",
      "m 14,14 -4,0 0,2 6,0 0,-6 -2,0 0,4 0,0 z"
    );
    Node.fullscreen_svg_1.setAttribute(
      "d",
      "m 22,14 0,-4 -2,0 0,6 6,0 0,-2 -4,0 0,0 z"
    );
    Node.fullscreen_svg_2.setAttribute(
      "d",
      "m 20,26 2,0 0,-4 4,0 0,-2 -6,0 0,6 0,0 z"
    );
    Node.fullscreen_svg_3.setAttribute(
      "d",
      "m 10,22 4,0 0,4 2,0 0,-6 -6,0 0,2 0,0 z"
    );
    document.addEventListener("mousemove", mousepause);
    return;
  } else {
    Node.fullscreen_svg_0.setAttribute(
      "d",
      "m 10,16 2,0 0,-4 4,0 0,-2 L 10,10 l 0,6 0,0 z"
    );
    Node.fullscreen_svg_1.setAttribute(
      "d",
      "m 20,10 0,2 4,0 0,4 2,0 L 26,10 l -6,0 0,0 z"
    );
    Node.fullscreen_svg_2.setAttribute(
      "d",
      "m 24,24 -4,0 0,2 L 26,26 l 0,-6 -2,0 0,4 0,0 z"
    );
    Node.fullscreen_svg_3.setAttribute(
      "d",
      "M 12,20 10,20 10,26 l 6,0 0,-2 -4,0 0,-4 0,0 z"
    );
    clearInterval(autohide.timer);
    mousemove_user();
    return;
  }
});
// 实现前进x秒后退x秒，阻止浏览器默认滚动事件,并且在播放进度为0和1时不触发该事件
document.addEventListener("keydown", (e) => {
  if (state.progress === 0 || state.progress === 1) {
    return;
  }
  let time = state.back_forward_time / 1000;
  //左右方向键
  if (e.key === "ArrowRight") {
    e.preventDefault();
    Node.video.currentTime += time;
  }
  if (e.key === "ArrowLeft") {
    e.preventDefault();
    Node.video.currentTime -= time;
  }
});
//
//-------------------全屏按钮及兼容性适配------------------------//
Node.fullscreen_btn.addEventListener("click", (e) => {
  e.stopPropagation();
  if (document.fullscreenElement !== null) {
    cancelFullscreen();
    return;
  } else {
    fullscreen(Node.player);
    return;
  }
});
// Node.player_cover 接收其他元素转发的事件并渲染出样式
Node.player_cover.addEventListener("video_load_failed", function () {
  this.innerHTML = "视频加载失败";
});
Node.player_cover.addEventListener("video_pause", function () {
  this.innerHTML = "视频暂停";
});
Node.player_cover.addEventListener("video_bad_network", function () {
  this.innerHTML = "网络不畅,请刷新";
});
Node.video.addEventListener("video_ready_to_load", fn.load_video);
// Node.video.addEventListener("waiting", () => {
//   console.log("waiting");
// });
// reload
// stalled
// /媒体资源加载完成时触发，可用来解绑事件
// Node.video.addEventListener("suspend", () => {
//   console.log("suspend");
// });
