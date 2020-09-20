localStorage.clear()
// 自定义全局配置，从localStorage提取数据
let state = {
  is_play: false,
  can_play: false,
  total_time: null,
  cur_time: null,
  progress: localStorage.progress || null,
  volume: localStorage.volume || 0.5,
  rate: localStorage.rate || 1,
  timer: null,
  timeout: 5000,
  back_forward_time: 1000
}
