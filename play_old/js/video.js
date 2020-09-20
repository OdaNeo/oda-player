import anime from 'animejs/lib/anime.es.js'
import { fullscreen, cancelFullscreen } from '../../src/utils/fullscreen'
import { autohide, mousePause } from '../../src/utils/mousepause'

export default class OPlayer {
  constructor({ ...arg }) {
    // config
    this.el = arg.el
    this.url = arg.url
    this.width = arg.width > 600 ? arg.width : 600
    this.height = arg.height || 450
    this.event = arg.event || 'load'
    // 构建页面html
    build(this.el)
    // 参数
    this.is_play = false
    this.can_play = false
    this.total_time = null
    this.cur_time = null
    this.progress = localStorage.progress || null
    this.volume = localStorage.volume || 0.5
    this.rate = localStorage.rate || 1
    this.timer = null
    this.back_forward_time = 2000
    // event
    this.video_ready_to_load = new CustomEvent('video_ready_to_load')
    // 获取dom元素
    let that = this
    this.video = this.el.querySelector('#video')
    this.cover = this.el.querySelector('#player_cover')
    this.control = this.el.querySelector('#player_control')
    this.buffered_range_x = this.control.querySelector('.buffered').querySelector('.range_x')
    this.played_range_x = this.control.querySelector('.played').querySelector('.range_x')
    this.volume_btn = this.control.querySelector('.volume_time').querySelector('.volume_btn')
    this.volume_line_range_x = this.control.querySelector('.volume_time').querySelector('.range_x')
    // svg anime
    this.volume_svg = this.control.querySelector('#volume_svg')
    this.play_svg = this.control.querySelector('#play_svg')
    this.fullscreen_svg_0 = this.control.querySelector('#fullscreen_svg_0')
    this.fullscreen_svg_1 = this.control.querySelector('#fullscreen_svg_1')
    this.fullscreen_svg_2 = this.control.querySelector('#fullscreen_svg_2')
    this.fullscreen_svg_3 = this.control.querySelector('#fullscreen_svg_3')

    this.play_btn = this.control.querySelector('.play_btn')
    this.cur_time_html = this.control.querySelector('.cur_time')
    this.full_time_html = this.control.querySelector('.full_time')

    this.playRate_btn = this.control.querySelector('.playRate_btn')
    this.playRate_btn_btn = this.playRate_btn.querySelector('.btn')
    this.playbackrate = this.playRate_btn.querySelectorAll('.playbackrate')
    this.fullscreen_btn = this.control.querySelector('.fullscreen_btn')
    //
    // 为宽度赋值
    this.el.style.width = this.width + 'px'
    this.el.style.height = this.height + 'px'
    //
    // 实例化Range组件, 包括视频播放进度条和音量条
    this.played = new Range(this.played_range_x, 'X')
    this.volume_line = new Range(this.volume_line_range_x, 'X')
    //---------------this.el绑定事件-----------------------------------//
    this.el.addEventListener('mouseenter', e => {
      e.stopPropagation()
      this.control.style.opacity = '1'
    })
    this.el.addEventListener('mouseleave', e => {
      e.stopPropagation()
      this.control.style.opacity = '0'
    })
    window.addEventListener(
      this.event,
      (this.fn = () => {
        that.set_video_src(that)
      })
    )
    //---------------el.video绑定事件-------------------------------------//
    this.video.addEventListener('video_ready_to_load', that.load_video)
    // 视频可用，加载视频元数据时获取视频总时长
    this.video.addEventListener('loadedmetadata', () => {
      that.get_total_time(that)
    })
    // 绑定播放暂停和点击等事件,第一帧加载完
    this.video.addEventListener('loadeddata', () => {
      that.ready_to_play(that)
    })
    // 获得视频可以播放时的已经缓存的长度
    this.video.addEventListener('canplay', () => {
      that.buffered_progress(that)
    })
    // 视频播放过程中始终触发的事件, 更新this.progress
    this.video.addEventListener('timeupdate', () => {
      that.time_up_date(that)
    })
    // 加载资源过程中网络状况检查，绘制缓存进度条
    this.video.addEventListener('progress', () => {
      // let rS = that.video.readyState;
      // rS=2有视频源，但是网络状况较差
      // if (rS === 2) {
      //   that.cover.innerHTML = "网络不畅,请刷新";
      //   that.pause(that);
      // }
      that.buffered_progress(that)
    })
    // 视频加载失败
    this.video.addEventListener('error', function () {
      let error_code = that.video.error.code
      if (error_code == '1') {
        that.cover.innerHTML = '读取或加载媒体文件出错'
        return
      } else if (error_code == '2') {
        that.cover.innerHTML = '网络错误'
        return
      } else if (error_code == '3') {
        that.cover.innerHTML = '解码错误'
        return
      } else {
        that.cover.innerHTML = '视频资源不可用'
      }
    })
    // -----------------document事件绑定-------------------------------//
    // 全屏隐藏底栏以及鼠标，引入mousepause鼠标悬停事件
    document.addEventListener('fullscreenchange', () => {
      that.full_screen_change(that)
    })
    // 实现前进x秒后退x秒，阻止浏览器默认滚动事件,并且在播放进度为0和1时不触发该事件
    document.addEventListener('keydown', e => {
      if (that.progress === 0 || that.progress === 1) {
        return
      }
      let time = that.back_forward_time / 1000
      //左右方向键
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        that.video.currentTime += time
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        that.video.currentTime -= time
      }
    })
    //-------------------全屏按钮及兼容性适配------------------------//
    this.fullscreen_btn.addEventListener('click', e => {
      e.stopPropagation()
      if (document.fullscreenElement !== null) {
        cancelFullscreen()
        return
      } else {
        fullscreen(that.el)
        return
      }
    })
  }
  // 地址懒加载
  set_video_src(el) {
    el.video.src = el.url
    el.video.dispatchEvent(el.video_ready_to_load)
  }
  // 成功给src赋值后，开始加载视频,解绑事件
  load_video() {
    window.removeEventListener(this.event, this.fn)
  }
  // 更新视频时间的方法
  video_time(no, time, el) {
    let m = el.duo_number(parseInt(time / 60)) || '--'
    let s = el.duo_number(parseInt(time % 60)) || '--'
    no.innerHTML = `${m}:${s}`
  }
  // 为数字补全成两位的函数
  duo_number(num) {
    if (isNaN(num)) {
      return
    } else {
      return (num = num < 10 ? `0${num}` : num)
    }
  }
  // 视频可用，清除el.timer，并初始化视频播放长度，更新视频时间
  get_total_time(el) {
    clearTimeout(el.timer)
    el.total_time = el.video.duration
    el.video_time(el.full_time_html, el.total_time, el)
    el.video_time(el.cur_time_html, el.total_time * el.progress, el)
  }
  // 视频加载成功,绑定播放暂停,按钮点击,倍速播放等事件, 初始化播放器
  ready_to_play(el) {
    el.can_play = true
    el.cover.innerHTML = ''
    el.init(el)
    el.play_btn.addEventListener('click', e => {
      e.stopPropagation()
      el.play_toggle(el)
    })
    el.video.addEventListener('click', e => {
      e.stopPropagation()
      el.play_toggle(el)
    })
    el.video.addEventListener('ended', () => {
      el.pause(el)
      return
    })
    document.addEventListener('keyup', e => {
      if (e.code !== 'Space') {
        return false
      } else {
        el.play_toggle(el)
      }
    })
    // 继承Range上的get方法, 获得实时的progress
    el.played_range_x.addEventListener('getRange', () => {
      el.progress = el.played.getRange()
      el.video.currentTime = el.progress * el.total_time
      el.video_time(el.cur_time_html, el.video.currentTime, el)
    })
    el.volume_line_range_x.addEventListener('getRange', () => {
      el.volume = el.volume_line.getRange()
      el.volume_toggle(el.volume, el)
    })
    // 定义切换按钮动作
    el.volume_btn.addEventListener('click', () => {
      if (el.volume != 0) {
        el.volume_toggle(0, el)
      } else {
        el.volume_toggle(0.5, el)
      }
    })
    //倍速播放(保存本地播放速度)
    for (let i = 0, len = el.playbackrate.length; i < len; i++) {
      el.playbackrate[i].addEventListener('click', function (e) {
        e.stopPropagation()
        let a = this.innerHTML
        let b = this.getAttribute('value')
        let c = el.playRate_btn_btn.innerHTML
        if (a === c) {
          return
        } else {
          el.video.playbackRate = b
          el.playRate_btn_btn.innerHTML = a
          localStorage.rate = b
        }
      })
    }
  }
  // 初始化视频样式(音量和播放速度)，提取数据 在视频加载成功后, 执行init
  init(el) {
    //初始时为静音状态或者音量为0
    if (el.volume == 0) {
      el.volume_toggle(0, el)
    } else {
      el.volume_toggle(el.volume, el)
    }
    // 修正el.rate=1.0时显示错误的问题
    let a = Number(el.rate).toFixed(1)
    el.playRate_btn_btn.innerHTML = `${a}倍速`
    el.played.setRange(el.progress)
    el.video.currentTime = el.progress * el.total_time
  }
  // 播放过程中触发的事件，绘制播放进度条
  time_up_date(el) {
    if (el.can_play === false) {
      return
    }
    el.cur_time = el.video.currentTime
    el.video_time(el.cur_time_html, el.cur_time, el)
    el.progress = Math.round((el.cur_time / el.total_time) * 100) / 100
    el.played.setRange(el.progress)
  }
  // 绘制缓存进度条
  buffered_progress(el) {
    let buff = el.video.buffered
    let bar = el.buffered_range_x.querySelector('.range_bar')
    if (buff.length >= 1) {
      bar.style.width = (buff.end(0) / el.total_time) * 100 + '%'
    }
  }
  // full_screen_change,改变svg图标的函数，以及实现鼠标
  full_screen_change(el) {
    if (document.fullscreenElement !== null) {
      el.fullscreen_svg_0.setAttribute('d', 'm 14,14 -4,0 0,2 6,0 0,-6 -2,0 0,4 0,0 z')
      el.fullscreen_svg_1.setAttribute('d', 'm 22,14 0,-4 -2,0 0,6 6,0 0,-2 -4,0 0,0 z')
      el.fullscreen_svg_2.setAttribute('d', 'm 20,26 2,0 0,-4 4,0 0,-2 -6,0 0,6 0,0 z')
      el.fullscreen_svg_3.setAttribute('d', 'm 10,22 4,0 0,4 2,0 0,-6 -6,0 0,2 0,0 z')
      document.addEventListener('mousemove', () => {
        mousePause(el.mousemove, el.mousepause, el)
      })
      return
    } else {
      el.fullscreen_svg_0.setAttribute('d', 'm 10,16 2,0 0,-4 4,0 0,-2 L 10,10 l 0,6 0,0 z')
      el.fullscreen_svg_1.setAttribute('d', 'm 20,10 0,2 4,0 0,4 2,0 L 26,10 l -6,0 0,0 z')
      el.fullscreen_svg_2.setAttribute('d', 'm 24,24 -4,0 0,2 L 26,26 l 0,-6 -2,0 0,4 0,0 z')
      el.fullscreen_svg_3.setAttribute('d', 'M 12,20 10,20 10,26 l 6,0 0,-2 -4,0 0,-4 0,0 z')
      clearInterval(autohide.timer)
      el.mousemove(el)
      return
    }
  }
  // mousePause回调函数1
  mousemove(el) {
    el.control.style.opacity = '1'
    el.video.style.cursor = 'auto'
  }
  // mousePause回调函数2
  mousepause(el) {
    el.control.style.opacity = '0'
    el.video.style.cursor = 'none'
  }
  // 播放时
  play(el) {
    el.video.play()
    anime({
      targets: el.play_svg,
      d: 'M 12,26 16,26 16,10 12,10 z M 21,26 25,26 25,10 21,10 z',
      duration: 150,
      easing: 'linear'
    })
    el.is_play = true
  }
  // 暂停或者播放完毕,暂停时记录播放进度
  pause(el) {
    el.video.pause()
    anime({
      targets: el.play_svg,
      d: 'M 12,26 18.5,22 18.5,14 12,10 z M 18.5,22 25,18 25,18 18.5,14 z',
      duration: 150,
      easing: 'linear'
    })
    el.is_play = false
    localStorage.progress = el.video.currentTime / el.total_time
    localStorage.volume = el.video.volume
  }
  //判断视频是否正在播放，并且切换图标样式
  play_toggle(el) {
    if (!el.is_play) {
      el.play(el)
      return
    } else {
      el.pause(el)
      return
    }
  }
  //判断音量以及是否静音，并切换样式
  volume_toggle(vol = 0.5, el) {
    if (vol == 0) {
      anime({
        targets: el.volume_svg,
        opacity: 1,
        duration: 200,
        easing: 'linear'
      })
    } else {
      anime({
        targets: el.volume_svg,
        opacity: 0,
        duration: 200,
        easing: 'linear'
      })
    }
    localStorage.volume = vol
    el.volume = vol
    el.video.volume = vol
    el.volume_line.setRange(vol)
  }
}
