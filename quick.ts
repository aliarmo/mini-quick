import Message from './lib/message'
import requestFactory, { first_screen_name, register } from './lib/request-factory'

let message = new Message()

interface pageData {
  state: object,
  origin: object
}

let global_cache = {}

/**
 *
 * @param {页面名字} name
 * @param {页面配置} options
 */
function P(name: string, options: any) {

  let methodValidate = ['onPageDataPreloadCallback', 'onPageDataFirstScreenCallback']
  let methodWrapper = ['onPageDataPreloadCallback', 'onPageDataFirstScreenCallback', 'onPageDataPagingCallback']
  methodValidate.forEach(val => {
    if (!options[val]) {
      throw new Error(`页面options中缺少 ${val} 方法，请实现`)
    }
  })
  methodWrapper.forEach(val => {
    let former = options[val]
    if (former) {
      options[val] = function () {
        let deltData = former.apply(this, arguments)
        return extend[val].call(this, deltData)
      }
    }
  })
  let requestPageData = options.$requestPageData
  message.on(`preload:${name}`, () => {
    extend.$onPreload()
  })

  let extend = {
    data: {
      state: '',   // 业务首屏数据
    },
    onLoad() {
      let data = this.$take()  // preload的
      let isPreload = true
      if (!data) {
        if (this.isCacheFirstScreen) {
          data = this.$getFirstScreen()
        }
        isPreload = false
      }
      if (data) {
        this.setData({
          state: data.state
        })
        this.$setOrigin(data.origin)
      }
      // 如果preload失败
      if (!isPreload) {
        this.$requestPageData()
      }

    },
    // 存储数据源，挂载在this上，页面this实例存在的时候调用
    $getOrigin: function () {
      return this._origin
    },
    $setOrigin: function (origin) {
      this._origin = origin
    },
    // 获取缓存数据
    $take: function () {
      let data = global_cache[name]
      global_cache[name] = undefined
      return data
    },
    $put: function (data: any) {
      global_cache[name] = data
    },
    // 首屏数据缓存
    $setFirstScreen: function (data: { origin: object, state: object }) {
      wx.setStorage({
        key: name,
        data
      })
    },
    $getFirstScreen: function () {
      return wx.getStorageSync(name);
    },
    $onPreload() {
      this.$requestPageData('', true)
    },
    $preload(name) {
      message.emit(`preload:${name}`)
    },
    $retry(extraParam) {
      this.$requestPageData(extraParam)
    },
    // 默认使用first_screen_name这个数据源配置作为首屏，当然用户也可以自己实现$requestPageData去获取自己的数据
    $requestPageData(extraParam, isPreload) {
      (requestPageData || this.$request).call(this, '', extraParam).then(data => {
        let formatted
        if (isPreload) {
          formatted = options.onPageDataPreloadCallback(data)
          if (formatted) {
            if (formatted.origin && formatted.state) {
              this.$put(formatted)
              options.isCacheFirstScreen && this.$setFirstScreen(formatted)
            }
          }
        } else if (!extraParam) {
          formatted = this.onPageDataFirstScreenCallback(data)
          if (formatted) {
            formatted.origin && this.$setOrigin(formatted.origin)
            formatted.state && this.setData({
              state: formatted.state
            })
            if (formatted.origin && formatted.state) {
              this.isCacheFirstScreen && this.$setFirstScreen(formatted)
            }
          }
        } else {
          formatted = this.onPageDataPagingCallback(data)
          if (formatted) {
            formatted.origin && this.$setOrigin(formatted.origin)
            formatted.state && this.setData({
              state: formatted.state
            })
          }
        }
      }).catch(err => {
        console.log("[error]", err)
      })
    },
    $request(moduleName, extraParam) {
      return requestFactory(name, moduleName, extraParam)
    },
    $paging() {
      let param = this.onBeforePaging()
      this.$requestPageData(param)
    },
    // 重载首屏预加载的数据处理方法
    onPageDataPreloadCallback(data): pageData {
      return data
    },
    // 重载首屏的数据处理方法
    onPageDataFirstScreenCallback(data): pageData {
      return data
    },
    // 重载翻页的数据处理方法
    onPageDataPagingCallback(data): pageData {
      return data
    }
  }
  options.$requestPageData = extend.$requestPageData
  options.data = {
    ...extend.data,
    ...options.data
  }
  options.onLoad = Wrapper(extend.onLoad, options.onLoad || noop)
  Page({
    ...extend,
    ...options
  })
}


function Wrapper(before: Function, after: Function) {
  return function () {
    before.apply(this, arguments)
    after.apply(this, arguments)
  }
}

export default P

export { register, requestFactory, first_screen_name }  //可以 import {register} ?


function noop() { }
