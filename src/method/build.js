// build player_control html
export default function (el) {
  let player_control = el.querySelector("#player_control");
  let div1 = document.createElement("div");

  div1.classList.add("player_controlbar");
  div1.innerHTML = `<div class="buffered"><div class="range_x"><div class="range_wrap"><div class="range_bar"></div></div></div></div><div class="played"><div class="range_x"><div class="range_wrap"><div class="range_bar"></div><div class="range_wrap_inner"></div></div><div class="range_btn"><div class="range_btn_inner"></div></div></div></div>`;
  player_control.appendChild(div1);

  let div2 = document.createElement("div");
  div2.className = "player_btn";
  div2.innerHTML = `<div class="volume_time"><span class="volume_btn"><svg xmlns="http://www.w3.org/2000/svg" height="36px" viewBox="5 5 36 36" width="36px"><path d="M8,21 L12,21 L17,26 L17,10 L12,15 L8,15 L8,21 Z M19,14 L19,22 C20.48,21.32 21.5,19.77 21.5,18 C21.5,16.26 20.48,14.74 19,14 ZM19,11.29 C21.89,12.15 24,14.83 24,18 C24,21.17 21.89,23.85 19,24.71 L19,26.77 C23.01,25.86 26,22.28 26,18 C26,13.72 23.01,10.14 19,9.23 L19,11.29 Z"/><path id="volume_svg" d="M 9.25,9 7.98,10.27 24.71,27 l 1.27,-1.27 Z" style="opacity: 0;"/></svg></span><span class="volume_line"><div class="range_x"><div class="range_wrap"><div class="range_bar"></div><div class="range_wrap_inner"></div></div><div class="range_btn"><div class="range_btn_inner"></div></div></div></span></div><div class="play"><div class="play_btn"><svg xmlns="http://www.w3.org/2000/svg" height="36px"  viewBox="5 5 36 36" width="36px"><path id="play_svg" d="M 12,26 18.5,22 18.5,14 12,10 z M 18.5,22 25,18 25,18 18.5,14 z"/></svg></div></div><div class="fullScreen_playRate"><span class="time"><span class="cur_time">--:--</span><span>/</span><span class="full_time">--:--</span></span><div class="playRate_btn"><span class="btn">1.0倍速</span><span class="layer"><span class="playbackrate" value="0.5">0.5倍速</span><span class="playbackrate" value="1.0">1.0倍速</span><span class="playbackrate" value="1.5">1.5倍速</span><span class="playbackrate" value="2.0">2.0倍速</span></span></div><div class="fullscreen_btn"><svg xmlns="http://www.w3.org/2000/svg" height="36px" viewBox="5 5 36 36" width="36px"><g><path  id="fullscreen_svg_0" d="m 10,16 2,0 0,-4 4,0 0,-2 L 10,10 l 0,6 0,0 z"/></g><g><path id="fullscreen_svg_1" d="m 20,10 0,2 4,0 0,4 2,0 L 26,10 l -6,0 0,0 z" /></g><g><path id="fullscreen_svg_2" d="m 24,24 -4,0 0,2 L 26,26 l 0,-6 -2,0 0,4 0,0 z"/></g><g><path id="fullscreen_svg_3" d="M 12,20 10,20 10,26 l 6,0 0,-2 -4,0 0,-4 0,0 z"/></g></svg></div></div>`;
  player_control.appendChild(div2);
}
