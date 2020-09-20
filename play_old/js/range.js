class Range {
  constructor(selector, direction, val) {
    // selector 对象class
    // direction 方向XY
    // val this.progress值接收的元素
    this.selector = selector
    this.range_wrap = this.selector.querySelector('.range_wrap')
    this.range_bar = this.selector.querySelector('.range_bar')
    this.range_btn = this.selector.querySelector('.range_btn')
    this.direction = direction
    this.fn_move
    this.fn_up
    this.XY
    this.init(this.direction)
    this.progress
    // 自定义getRange事件
    this.event = new CustomEvent('getRange')
  }
  //判断是竖直方向还是横向，并给XY配置参数
  init(direction) {
    if (direction === 'X') {
      this.XY = {
        clientXY: 'clientX',
        offsetLeftTop: 'offsetLeft',
        offsetWidthHeight: 'offsetWidth',
        lefttop: 'left',
        widthheight: 'width',
        offsetXY: 'offsetX'
      }
    } else {
      this.XY = {
        clientXY: 'clientY',
        offsetLeftTop: 'offsetTop',
        offsetWidthHeight: 'offsetHeight',
        lefttop: 'top',
        widthheight: 'height',
        offsetXY: 'offsetY'
      }
    }
    this.event(this.XY)
  }
  //绑定事件mouse以及click
  event(XY) {
    this.range_btn.addEventListener('mousedown', e => {
      let l = e[XY.clientXY] - this.range_btn[XY.offsetLeftTop]
      document.addEventListener(
        'mousemove',
        (this.fn_move = e => {
          e.preventDefault()
          let x = e[XY.clientXY] - l
          let max = this.range_wrap[XY.offsetWidthHeight]
          x = x < 0 ? 0 : x
          x = x > max ? max : x
          this.range_btn.style[XY.lefttop] = (x / max) * 100 + '%'
          this.range_bar.style[XY.widthheight] = (x / max) * 100 + '%'
          this.progress = Math.round((x / max) * 100) / 100
          // 派发事件，由selector接收
          this.selector.dispatchEvent(this.event)
        })
      )
      document.addEventListener(
        'mouseup',
        (this.fn_up = () => {
          document.removeEventListener('mousemove', this.fn_move)
          document.removeEventListener('mouseup', this.fn_up)
        })
      )
      return false
    })
    this.range_wrap.addEventListener('click', e => {
      let x = e[XY.offsetXY]
      let max = this.range_wrap[XY.offsetWidthHeight]
      x = x < 0 ? 0 : x
      x = x > max ? max : x
      this.range_btn.style[XY.lefttop] = (x / max) * 100 + '%'
      this.range_bar.style[XY.widthheight] = (x / max) * 100 + '%'
      // 保留两位小数
      this.progress = Math.round((x / max) * 100) / 100
      // 派发事件，由selector接收
      this.selector.dispatchEvent(this.event)
    })
  }
  getRange() {
    // 实时获得this.progress的值
    return this.progress
  }
  setRange(r) {
    if (isNaN(r) || r < 0 || r > 1) {
      throw new Error('传入值不合法')
    }
    this.range_btn.style[this.XY.lefttop] = r * 100 + '%'
    this.range_bar.style[this.XY.widthheight] = r * 100 + '%'
  }
}
