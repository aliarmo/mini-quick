
let dataCache = {}
let dataConfig

export const first_screen_name = 'FIRST_SCREEN_NAME'   // 首屏配置名称
export function register(config) {
  dataConfig = config
}

export default (name, moduleName, extraParam) => {
  let config = getConfigByName(name, moduleName)
  if (!config) {
    throw new Error(`缺少名字为${name}模块名为${moduleName}的数据源配置`)
  }
  let def = genDefaultConfig()
  let url = config.url
  let p = config.fixBefore && config.fixBefore(extraParam)
  let promise
  if (p && p.then) {
    promise = p
  } else {
    promise = Promise.resolve(p)
  }
  return promise.then(param => {
    param = { ...def.fixBefore(extraParam), ...param }
    let fixAfter = function (data) {
      let res
      // 如果开发者有提供fixAfter，那就开发者决定是否走到onError，否则框架只会看返回的http错误码来决定
      if (config.fixAfter) {
        let deltData = config.fixAfter(data, param, url)
        res = deltData && deltData[0] ? deltData : def.fixAfter(deltData[1] || data, param, url)
      } else if (data && code2xx3xx(data.statusCode)) {
        res = def.fixAfter(data, param, url)
      } else {
        res = [data, null]
      }
      return res
    }
    let onError = function (err) {
      let deltError
      if (config.onError) {
        deltError = config.onError(err, param, url)
      }
      return def.onError(deltError || err, param, url)
    }
    return new Promise((resolve, reject) => {
      console.log("request param", param)
      let options = {
        url,
        ...param,
        success(res) {
          console.log("wx.request success", res)
          let fixedRes = fixAfter(res)
          if (fixedRes && fixedRes[0]) {
            options.fail(fixedRes[0])
          } else {
            resolve(fixedRes)
          }
        },
        fail(err) {
          console.log("wx.request fail", err)
          let res = onError(err)
          resolve(res)
        }
      }
      // @ts-ignore
      wx.request(options)
    })
  })

}

function code2xx3xx(code) {
  return code >= 200 && code < 400
}

export function genDefaultConfig() {
  return {
    fixBefore(param) {

      // requestParam
      return {
        data: {},
        header: { 'content-type': 'application/json' },
        method: 'GET',
        dataType: 'json',
        responseType: 'text',
        ...param
      }
    },
    fixAfter(data, requestParam, url) {
      let key = genDefaultCacheKey(requestParam, url)
      //持久化缓存
      if (requestParam.isPersistent) {
        // @ts-ignore
        wx.setStorage({
          key,
          data
        })
      } else {
        dataCache[key] = data
      }
      return [null, data]
    },
    onError(err, requestParam, url) {
      let key = genDefaultCacheKey(requestParam, url)
      let data = requestParam.isPersistent ? wx.getStorageSync(key) : dataCache[key]
      console.log("【onError 】", data ? `hit cache` : `no cache`, data, err)
      return [data ? null : err, data]
    }
  }
}

function genDefaultCacheKey(param, url) {
  return param.key || `${url}_${JSON.stringify(param)}`
}

export function getPageConfig(name) {
  return dataConfig[name]
}
export function getConfigByName(name, moduleName) {
  return getPageConfig(name)[moduleName || first_screen_name]
}
