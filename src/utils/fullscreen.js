//全屏方法
export const fullscreen = (el) => {
  if (el.requestFullscreen) {
    el.requestFullscreen();
  } else if (el.mozRequestFullScreen) {
    el.mozRequestFullScree();
  } else if (el.webkitRequestFullScreen) {
    el.webkitRequestFullScreen();
  } else if (el.msRequestFullscreen) {
    el.msRequestFullscreen();
  } else throw new Error(`您的浏览器不支持全屏`);
};
//退出全屏的方法
export const cancelFullscreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else throw new Error(`您的浏览器不支持全屏`);
};
