import './styles/reset.css'

import style from './styles/index.css' // css module

import playSvg from './styles/svg/play.svg'

import volSvg from './styles/svg/volume.svg'

import fullscreenSvg from './styles/svg/fullscreen.svg'

import anime from 'animejs/lib/anime.es.js'

import { fullscreen, cancelFullscreen } from './utils/fullscreen'

export class OdaPlayer {
  constructor({ ...arg }) {
    this.el = arg.el
    this.url = arg.url
    this.width = arg.width || 800
    this.height = arg.height || 450
    // 初始化
    this.isPlay = false
    this.canPlay = false
    this.totalTime = null
    this.curTime = null
    this.progress = localStorage.progress || null
    this.volume = localStorage.volume || 0.5
    this.rate = localStorage.rate || 1
    this.timer = null
    this.backForward = 2000

    // 鼠标自动隐藏
    this.autoHide = {
      diff: 3000, //时间间隔
      first_time: new Date().getTime(),
      last_time: new Date().getTime(),
      timer: null
    }

    this.init()
  }
  init() {
    this.el.innerHTML = `<div class="${style.player_container}">
                            <video class="${style.player_inner}">
                              <source src="${this.url}" preload="metadata" type="video/mp4" />
                            </video>
                            <div class="${style.player_cover}">正在加载</div>
                            <div class="${style.player_control}">
                              <div class="${style.player_controlbar}">
                                <div class="${style.controlbar_wrap}">
                                  <div class="${style.controlbar_total}"></div>
                                  <div class="${style.controlbar_buffered}"></div>
                                  <div class="${style.controlbar_played_bar}"></div>
                                </div>
                                <div class="${style.controlbar_played_btn}"></div>
                              </div>
                              <div class="${style.player_btn}">
                                <div class="${style.play_btn}"></div>
                                <div class="${style.volume_btn}"></div>
                                <div class="${style.volume_line}">
                                  <div class="${style.volume_line_bar}"></div>
                                  <div class="${style.volume_line_btn}"></div>
                                </div>
                                <div class="${style.time}">
                                  <span class="${style.cur_time}">00:00</span>
                                  <span class="${style.center_time}">/</span>
                                  <span class="${style.full_time}">00:00</span>
                                </div>
                                <div class="${style.playRate}">
                                  <div class="${style.playRate_layer}">
                                    <div class="${style.playbackrate}" value="0.5">0.5倍速</div>
                                    <div class="${style.playbackrate}" value="1.0">1.0倍速</div>
                                    <div class="${style.playbackrate}" value="1.5">1.5倍速</div>
                                    <div class="${style.playbackrate}" value="2.0">2.0倍速</div>
                                  </div>
                                  <div class="${style.playRate_btn}">1.0倍速</div>
                                </div>
                                <div class="${style.fullscreen_btn}"></div>
                              </div>
                            </div>
                          </div>`

    this.player_container = document.querySelector(`.${style.player_container}`)
    this.player_inner = document.querySelector(`.${style.player_inner}`)
    this.player_cover = document.querySelector(`.${style.player_cover}`)
    this.player_control = document.querySelector(`.${style.player_control}`)
    this.player_controlbar = document.querySelector(`.${style.player_controlbar}`)

    this.controlbar_buffered = document.querySelector(`.${style.controlbar_buffered}`)
    this.controlbar_played_bar = document.querySelector(`.${style.controlbar_played_bar}`)
    this.controlbar_played_btn = document.querySelector(`.${style.controlbar_played_btn}`)
    this.controlbar_wrap = document.querySelector(`.${style.controlbar_wrap}`)

    this.volume_line = document.querySelector(`.${style.volume_line}`)
    this.volume_line_btn = document.querySelector(`.${style.volume_line_btn}`)
    this.volume_line_bar = document.querySelector(`.${style.volume_line_bar}`)

    // svg
    this.play_btn = document.querySelector(`.${style.play_btn}`)
    this.volume_btn = document.querySelector(`.${style.volume_btn}`)
    this.fullscreen_btn = document.querySelector(`.${style.fullscreen_btn}`)

    this.player_container.style.width = this.width + 'px'
    this.player_container.style.height = this.height + 'px'
    this.play_btn.innerHTML = playSvg
    this.volume_btn.innerHTML = volSvg
    this.fullscreen_btn.innerHTML = fullscreenSvg

    // svg id
    this.play_svg_1 = this.player_control.querySelector(`#play_svg_1`)
    this.volume_svg_1 = this.player_control.querySelector(`#volume_svg_1`)
    this.volume_svg_2 = this.player_control.querySelector(`#volume_svg_2`)
    this.fullscreen_svg_0 = this.player_control.querySelector('#fullscreen_svg_0')
    this.fullscreen_svg_1 = this.player_control.querySelector('#fullscreen_svg_1')
    this.fullscreen_svg_2 = this.player_control.querySelector('#fullscreen_svg_2')
    this.fullscreen_svg_3 = this.player_control.querySelector('#fullscreen_svg_3')

    // anima
    this.playerControlShowHide() // player_control动画

    this.playRateShowHide() // playRate_layer动画

    this.handleFullscreen() // 全屏动画

    this.volumeToggle(this.volume) // 初始时为静音状态或者音量为0

    // 事件监听
    this.player_inner.addEventListener('loadedmetadata', () => {
      this.getTotalTime() // 加载视频元数据时获取视频总时长
    })

    this.player_inner.addEventListener('loadeddata', () => {
      this.readyToPlay() // 绑定播放暂停和点击等事件, 第一帧加载完
    })

    this.player_inner.addEventListener('canplay', () => {
      this.bufferedProgress() // 获得视频可以播放时的已经缓存的长度
    })

    this.player_inner.addEventListener('timeupdate', () => {
      this.timeUpDate() // 播放时触发
    })

    this.player_inner.addEventListener('progress', () => {
      this.bufferedProgress() // 加载资源过程中绘制缓存进度条
    })

    this.player_inner.addEventListener('waiting', () => {
      this.pause()
      this.player_cover.innerHTML = '缓冲' // 视频缓冲
    })

    this.player_inner.addEventListener('playing', () => {
      this.play()
      this.player_cover.innerHTML = '正在播放' // 视频恢复播放
    })

    this.player_inner.addEventListener('error', () => {
      console.log('error')
      let error_code = this.player_inner.error.code // TODO:测试错误捕捉

      if (error_code == '1') {
        this.player_cover.innerHTML = '读取或加载媒体文件出错'
        return
      } else if (error_code == '2') {
        this.player_cover.innerHTML = '网络错误'
        return
      } else if (error_code == '3') {
        this.player_cover.innerHTML = '解码错误'
        return
      } else {
        this.player_cover.innerHTML = '视频资源不可用'
      }
    })

    window.addEventListener('unhandledrejection', e => {
      e && e.preventDefault() // 拦截全局未捕捉的 promise 错误。video.play() promise对象
    })
  }

  // 清除this.timer，并初始化视频播放长度，更新视频时间
  getTotalTime() {
    this.fullTimeEl = document.querySelector(`.${style.full_time}`)
    this.curTimeEl = document.querySelector(`.${style.cur_time}`)

    clearTimeout(this.timer)

    this.totalTime = this.player_inner.duration // 总时长

    this.videoTime(this.fullTimeEl, this.totalTime)
    this.videoTime(this.curTimeEl, this.totalTime * this.progress)
  }

  // 绑定播放暂停和点击等事件, 第一帧加载完
  readyToPlay() {
    this.play_svg = document.querySelector(`.${style.play_svg}`)
    this.playRateBtn = document.querySelector(`.${style.playRate_btn}`)

    this.canPlay = true
    this.player_cover.innerHTML = 'ready'

    // 修正el.rate=1.0时显示错误的问题
    let a = Number(this.rate).toFixed(1)
    this.playRateBtn.innerHTML = `${a}倍速`
    // el.played.setRange(el.progress)
    this.player_inner.currentTime = this.progress * this.totalTime

    this.handlePlay() // 播放暂停动作声明绑定

    this.handleVol() // 音量按钮动作

    this.handlePlayRate() // 播放速率

    this.handleBackForward() // 快进快退

    this.handlePlayerBarClick() // 播放进度条点击

    this.handleVolumeLineBar() // 音量进度条点击

    this.handlePlayerBtnDrag() // 播放进度按钮拖拽事件

    this.handleVolumeLineBtnDrag() // 播放进度按钮拖拽事件
  }

  // 绘制播放进度条
  timeUpDate() {
    if (this.canPlay === false) {
      return
    }
    this.curTime = this.player_inner.currentTime

    this.videoTime(this.curTimeEl, this.curTime)
    this.progress = Math.round((this.curTime / this.totalTime) * 100) / 100

    this.controlbar_played_bar.style.width = this.progress * 100 + '%'
    this.controlbar_played_btn.style.left = this.progress * 100 + '%'
  }

  // 获得视频可以播放时的已经缓存的长度
  bufferedProgress() {
    let buff = this.player_inner.buffered

    if (buff.length >= 1) {
      this.controlbar_buffered.style.width = (buff.end(0) / this.totalTime) * 100 + '%'
    }
  }
  // player_control动画
  playerControlShowHide() {
    this.player_container.addEventListener('mouseenter', e => {
      e.stopPropagation()
      this.player_control.style.opacity = 1
    })
    this.player_container.addEventListener('mouseleave', e => {
      e.stopPropagation()
      this.player_control.style.opacity = 0
    })
  }

  // playRate_layer动画
  playRateShowHide() {
    let _timer = null // 定时器

    this.playRate = document.querySelector(`.${style.playRate}`)
    this.playRate_layer = document.querySelector(`.${style.playRate_layer}`)
    this.playRate_layer.style.height = 0

    this.playRate.addEventListener('mouseenter', e => {
      e.stopPropagation()
      clearTimeout(_timer)

      if (this.playRate_layer.style.height === '0px') {
        this.playRate_layer.style.display = 'block'

        setTimeout(() => {
          if (this.playRate_layer.style.display === 'none') {
            return
          }
          this.playRate_layer.style.height = 136 + 'px'
        }, 10)
      }
    })
    this.playRate.addEventListener('mouseleave', e => {
      e.stopPropagation()

      this.playRate_layer.style.height = 0 + 'px'

      _timer = setTimeout(() => {
        this.playRate_layer.style.display = 'none'
      }, 300)
    })
  }

  // 播放暂停动作声明绑定
  handlePlay() {
    this.play_btn.addEventListener('click', e => {
      e.stopPropagation()
      this.playToggle(e)
    })
    this.player_inner.addEventListener('click', e => {
      e.stopPropagation()
      this.playToggle()
    })
    this.player_inner.addEventListener('ended', () => {
      this.pause()
      return
    })
    document.addEventListener('keyup', e => {
      e.stopPropagation()
      if (e.code !== 'Space') {
        return false
      } else {
        this.playToggle()
      }
    })
  }

  // 音量按钮动作
  handleVol() {
    this.volume_btn.addEventListener('click', e => {
      e.stopPropagation()

      if (this.volume !== 0) {
        this.volumeToggle(0)
      } else {
        this.volumeToggle(0.5)
      }
    })
  }

  // 倍速播放动作
  handlePlayRate() {
    this.playbackrate = document.querySelectorAll(`.${style.playbackrate}`)

    let len = this.playbackrate.length

    for (let i = 0; i < len; i++) {
      this.playbackrate[i].addEventListener('click', e => {
        e.stopPropagation()
        let a = this.playbackrate[i].innerHTML
        let b = this.playbackrate[i].getAttribute('value') // string
        let c = this.playRateBtn.innerHTML

        if (a === c) {
          return
        } else {
          this.player_inner.playbackRate = Number(b)
          this.playRateBtn.innerHTML = a
          localStorage.rate = Number(b)
        }
      })
    }
  }

  // 前进后退
  handleBackForward() {
    let _time = this.backForward / 1000

    document.addEventListener('keydown', e => {
      if (this.progress === 0 || this.progress === 1) {
        return // 在播放进度为0和1时不触发该事件
      }

      // 左右方向键
      if (e.key === 'ArrowRight') {
        e.preventDefault() // 阻止浏览器默认滚动事件,
        this.player_inner.currentTime += _time
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        this.player_inner.currentTime -= _time
      }
    })
  }

  // 全屏事件
  handleFullscreen() {
    this.fullscreen_btn.addEventListener('click', e => {
      e.stopPropagation()

      if (document.fullscreenElement !== null) {
        // 清除定时器，解绑事件
        clearInterval(this.autoHide.timer)

        document.removeEventListener('mousemove', this._fn_mouseP)

        cancelFullscreen()

        return
      } else {
        // 鼠标显示隐藏
        this.handleMouseShowHide()

        fullscreen(this.player_container)

        return
      }
    })
  }

  // handleFullScreenChange, 改变svg图标的函数，以及实现鼠标悬停消失
  handleFullScreenChange() {
    if (document.fullscreenElement !== null) {
      this.fullscreen_svg_0.setAttribute('d', 'm 14,14 -4,0 0,2 6,0 0,-6 -2,0 0,4 0,0 z')
      this.fullscreen_svg_1.setAttribute('d', 'm 22,14 0,-4 -2,0 0,6 6,0 0,-2 -4,0 0,0 z')
      this.fullscreen_svg_2.setAttribute('d', 'm 20,26 2,0 0,-4 4,0 0,-2 -6,0 0,6 0,0 z')
      this.fullscreen_svg_3.setAttribute('d', 'm 10,22 4,0 0,4 2,0 0,-6 -6,0 0,2 0,0 z')

      return
    } else {
      this.fullscreen_svg_0.setAttribute('d', 'm 10,16 2,0 0,-4 4,0 0,-2 L 10,10 l 0,6 0,0 z')
      this.fullscreen_svg_1.setAttribute('d', 'm 20,10 0,2 4,0 0,4 2,0 L 26,10 l -6,0 0,0 z')
      this.fullscreen_svg_2.setAttribute('d', 'm 24,24 -4,0 0,2 L 26,26 l 0,-6 -2,0 0,4 0,0 z')
      this.fullscreen_svg_3.setAttribute('d', 'M 12,20 10,20 10,26 l 6,0 0,-2 -4,0 0,-4 0,0 z')

      return
    }
  }

  // 点击播放进度条
  handlePlayerBarClick() {
    this.player_controlbar.addEventListener('click', e => {
      if (e.target.className === style.controlbar_played_btn) {
        return
      }
      let x = e.offsetX
      let max = this.player_controlbar.offsetWidth
      x = x < 0 ? 0 : x
      x = x > max ? max : x
      this.controlbar_played_btn.style.left = (x / max) * 100 + '%'
      this.controlbar_played_bar.style.width = (x / max) * 100 + '%'
      this.progress = Math.round((x / max) * 100) / 100 // 保留两位小数

      this.player_inner.currentTime = this.totalTime * this.progress
    })
  }

  // 点击音量进度条
  handleVolumeLineBar() {
    this.volume_line.addEventListener('click', e => {
      if (e.target.className === style.volume_line_btn) {
        return
      }
      let x = e.offsetX
      let max = this.volume_line.offsetWidth
      x = x < 0 ? 0 : x
      x = x > max ? max : x
      this.volume_line_btn.style.left = (x / max) * 100 + '%'
      this.volume_line_bar.style.width = (x / max) * 100 + '%'
      this.volume = Math.round((x / max) * 100) / 100 // 保留两位小数
      this.volumeToggle(this.volume)
    })
  }

  // 播放进度按钮拖拽事件
  handlePlayerBtnDrag() {
    this.controlbar_played_btn.addEventListener('mousedown', e => {
      let l = e.clientX - this.controlbar_played_btn.offsetLeft

      document.addEventListener(
        'mousemove',
        (this._fn_move = e => {
          e.preventDefault()

          let x = e.clientX - l
          let max = this.controlbar_wrap.offsetWidth

          x = x < 0 ? 0 : x
          x = x > max ? max : x

          this.controlbar_played_btn.style.left = (x / max) * 100 + '%'
          this.controlbar_played_bar.style.width = (x / max) * 100 + '%'
          this.progress = Math.round((x / max) * 100) / 100 // 保留两位小数

          this.player_inner.currentTime = this.totalTime * this.progress
        })
      )
      document.addEventListener(
        'mouseup',
        (this._fn_up = e => {
          document.removeEventListener('mousemove', this._fn_move)
          document.removeEventListener('mouseup', this._fn_up)
        })
      )
      return false
    })
  }

  // 播放进度按钮拖拽事件
  handleVolumeLineBtnDrag() {
    this.volume_line_btn.addEventListener('mousedown', e => {
      let l = e.clientX - this.volume_line_btn.offsetLeft

      document.addEventListener(
        'mousemove',
        (this.__fn_move = e => {
          e.preventDefault()

          let x = e.clientX - l
          let max = this.volume_line.offsetWidth

          x = x < 0 ? 0 : x
          x = x > max ? max : x

          this.volume_line_btn.style.left = (x / max) * 100 + '%'
          this.volume_line_bar.style.width = (x / max) * 100 + '%'

          this.volume = Math.round((x / max) * 100) / 100 // 保留两位小数

          this.volumeToggle(this.volume)
        })
      )
      document.addEventListener(
        'mouseup',
        (this.__fn_up = e => {
          document.removeEventListener('mousemove', this.__fn_move)
          document.removeEventListener('mouseup', this.__fn_up)
        })
      )
      return false
    })
  }

  // 更新视频时间
  videoTime(el, time) {
    let m = this.duoNumber(parseInt(time / 60)) || '00'
    let s = this.duoNumber(parseInt(time % 60)) || '00'
    el.innerHTML = `${m}:${s}`
  }

  // 为数字补全成两位
  duoNumber(num) {
    if (isNaN(num)) {
      return
    } else {
      return (num = num < 10 ? `0${num}` : num)
    }
  }

  // 播放时svg
  play() {
    this.isPlay = true
    anime({
      targets: this.play_svg_1,
      d: 'M 12,26 16,26 16,10 12,10 z M 21,26 25,26 25,10 21,10 z',
      duration: 150,
      easing: 'linear'
    })

    this.player_cover.innerHTML = '正在播放'
  }
  // 暂停或者播放完毕,暂停时记录播放进度
  pause() {
    this.isPlay = false
    anime({
      targets: this.play_svg_1,
      d: 'M 12,26 18.5,22 18.5,14 12,10 z M 18.5,22 25,18 25,18 18.5,14 z',
      duration: 150,
      easing: 'linear'
    })

    this.player_cover.innerHTML = '暂停'
    localStorage.progress = this.player_inner.currentTime / this.totalTime
    localStorage.volume = this.player_inner.volume
  }

  //判断视频是否正在播放，并且切换图标样式
  playToggle() {
    if (!this.isPlay) {
      this.player_inner.play()
      this.play()

      return
    } else {
      this.player_inner.pause()
      this.pause()

      return
    }
  }

  //判断音量以及是否静音，并切换样式
  volumeToggle(vol = 0.5) {
    if (Number(vol) === 0) {
      anime({
        targets: this.volume_svg_1,
        opacity: 1,
        duration: 150,
        easing: 'linear'
      })

      anime({
        targets: this.volume_svg_2,
        opacity: 1,
        duration: 150,
        easing: 'linear'
      })
    } else if (Number(vol) >= 0.5) {
      anime({
        targets: this.volume_svg_1,
        opacity: 1,
        duration: 150,
        easing: 'linear'
      })

      anime({
        targets: this.volume_svg_2,
        opacity: 0,
        duration: 150,
        easing: 'linear'
      })
    } else {
      anime({
        targets: this.volume_svg_1,
        opacity: 0,
        duration: 150,
        easing: 'linear'
      })

      anime({
        targets: this.volume_svg_2,
        opacity: 0,
        duration: 150,
        easing: 'linear'
      })
    }
    localStorage.volume = vol
    this.volume = vol
    this.player_inner.volume = vol

    this.volume_line_btn.style.left = vol * 100 + '%'
    this.volume_line_bar.style.width = vol * 100 + '%'
  }

  // 鼠标悬停消失
  handleMouseShowHide() {
    document.addEventListener(
      'mousemove',
      (this._fn_mouseP = e => {
        this.mouseP()
      })
    )
  }

  mouseP() {
    this.mouseShow()

    clearInterval(this.autoHide.timer)

    this.autoHide.first_time = new Date().getTime()

    this.autoHide.timer = setInterval(() => {
      this.autoHide.last_time = new Date().getTime()
      if (this.autoHide.last_time - this.autoHide.first_time > this.autoHide.diff) {
        this.mouseHide()

        clearInterval(this.autoHide.timer)
      }
    }, 10)
  }

  // mouseP回调函数1
  mouseShow() {
    this.player_control.style.opacity = 1
    this.player_inner.style.cursor = 'auto'
  }

  // mouseP回调函数2
  mouseHide() {
    this.player_control.style.opacity = 0
    this.player_inner.style.cursor = 'none'
  }
}
window.OdaPlayer = OdaPlayer
