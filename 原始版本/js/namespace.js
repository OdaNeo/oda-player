// namespace
const Node = {};
Node.player = document.querySelector(".player");
Node.video = Node.player.querySelector(".player_inner");
Node.player_cover = Node.player.querySelector(".player_cover");
Node.player_control = Node.player.querySelector(".player_control");

Node.buffered_range_x = Node.player_control
  .querySelector(".buffered")
  .querySelector(".range_x");
Node.played_range_x = Node.player_control
  .querySelector(".played")
  .querySelector(".range_x");
Node.volume_btn = Node.player
  .querySelector(".volume_time")
  .querySelector(".volume_btn");
Node.volume_line_range_x = Node.player
  .querySelector(".volume_time")
  .querySelector(".range_x");

Node.volume_svg = document.querySelector("#volume_svg");
Node.play_svg = document.querySelector("#play_svg");
Node.fullscreen_svg_0 = document.querySelector("#fullscreen_svg_0");
Node.fullscreen_svg_1 = document.querySelector("#fullscreen_svg_1");
Node.fullscreen_svg_2 = document.querySelector("#fullscreen_svg_2");
Node.fullscreen_svg_3 = document.querySelector("#fullscreen_svg_3");

Node.play_btn = Node.player.querySelector(".play_btn");

Node.cur_time_html = Node.player.querySelector(".cur_time");
Node.full_time_html = Node.player.querySelector(".full_time");

Node.playRate_btn = Node.player.querySelector(".playRate_btn");
Node.playRate_btn_btn = Node.playRate_btn.querySelector(".btn");
Node.playbackrate = Node.playRate_btn.querySelectorAll(".playbackrate");

Node.fullscreen_btn = Node.player.querySelector(".fullscreen_btn");
