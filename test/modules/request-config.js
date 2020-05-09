/**
 * 数据源配置
 */
import { first_screen_name } from './quick'

const INDEX_FIRST_SCREEN_NAME_URL = 'https://search.video.iqiyi.com/m?if=hotQuery&p=global'
const DEFAULT_WORD_URL = 'https://search.video.iqiyi.com/m?if=defaultQuery&response_type=2&platform=14&is_qipu_platform=1&u=3c3294b64afb76c1eabe195510f68080&pu='
const HOT_FIRST_SCREEN_NAME_URL = 'http://pcw-api.iqiyi.com/album/album/fytoplist?cid=6&dim=hour&type=realTime'

export default {
  index: {
    // index页面首屏数据配置
    [first_screen_name]: {
      url: INDEX_FIRST_SCREEN_NAME_URL,
      // 业务使用时传入的参数，返回值作为wx.request的请求参数
      fixBefore(extraParam) {

        // 支持promise
        return Promise.resolve({
          data: {
            username: 'ali'
          },
          header: {
            Cookie: 'username=123; age=18'
          },
          method: "GET",
          ...extraParam,
          isPersistent: true    // 框架会缓存接口每次返回的结果，默认缓存在内存，加上这个配置，缓存在storage
        })
      },
      // 拿到的wx.request的返回值
      fixAfter(data) {
        // 如果有返回值，必须是数组形式，数组第一项为错误对象，第二项为业务数据

        return [null, data]
      },
      // 对错误的处理，如果fixAfter的第一项有值，那就会走到onError
      onError(err) {
        return [err]
      }
    },
    // index页面另外一个接口数据配置
    default_word: {
      url: DEFAULT_WORD_URL
    }
  },
  hot: {
    // hot页面首屏数据配置
    [first_screen_name]: {
      url: HOT_FIRST_SCREEN_NAME_URL,
      fixBefore(extraParam) {

        return {
          data: {
            size: 10,
            page: 1
          },
          ...extraParam
        }
      }
    }
  }
}
