/**
 * Created by zx1984 9/6/2018
 * https://github.com/zx1984
 */
import broadcast from './broadcast'
import dom from './dom-core'
import Crop from './crop'
import { initInput } from './input'
import {
  blobToUrl,
  fileToBase64,
  toBlobData
} from './convert'
import { handerBase64 } from './handler-base64'
import { conversion } from './calculator'
import util from "./util"
import '../style/index.styl'

// default options
const DEFAUTL_OPTIONS = {
  width: 0,
  height: 0,
  selector: null,
  error () {},
  success () {}
}

let crop = {}

/**
 * ZxImageProcess
 */
class ZxImageProcess {
  /**
   * constructor
   * @param opts
   */
  constructor (opts) {
    // 参数处理
    this.options = Object.assign({}, DEFAUTL_OPTIONS, opts)
    // check selector
    if (!opts.selector || typeof opts.selector !== 'string') {
      this.options.error({
        code: 1,
        msg: `The selector "${opts.selector}" is not valid in initialization parameter.`
      })
      return
    }
    this.init(this.options)
  }

  /**
   * init
   * @param opts
   */
  init (opts) {
    // error notify
    broadcast.on('error', err => {
      this.options.error(err)
    })
    // success notify
    broadcast.on('success', data => {
      this.options.success(data)
    })
    // id
    this.id = util.randomId()
    // input[type=file] id
    this.inputId = util.randomId('input')
    // 是否裁剪图片
    this.crop = opts.width > 0 && opts.height > 0
    // body Element
    this.$body = dom.query('body')
    if (this.$body === null) {
      broadcast.emit('error', {
        code: 2,
        msg: `Failed to initialize, Element body is not found in document!`
      })
    }
    // 同时设置宽高，视为裁剪图片
    if (this.crop) {
      crop = new Crop({
        width: opts.width,
        height: opts.height,
        body: this.$body
      })

      // 裁剪图片
      broadcast.on('crop-submit', params => {
        handerBase64(this, params)
      })
    }

    initInput(this)
  }

  /**
   * 文件处理
   * @param file 图片文件
   */
  handle (file) {
    // 文件转base64，并判断类型
    fileToBase64(file).then(base64 => {
      this.file = file
      this.base64 = base64
      // 使用全局参数处理数据
      if (this.crop) {
        crop.handleImage(blobToUrl(file))
      } else {
        handerBase64(this)
      }
    }).catch(err => {
      broadcast.emit('error', err)
    })
  }

  /**
   * 重新裁剪
   */
  reCrop () {
    if (this.file) {
      crop.show()
    } else {
      broadcast.emit('error', {
        code: 5,
        msg: '请先选择图片文件'
      })
    }
  }
}

ZxImageProcess.prototype.conversion = conversion
ZxImageProcess.prototype.fileToBase64 = fileToBase64
ZxImageProcess.prototype.toBlobData = toBlobData

export { ZxImageProcess }
