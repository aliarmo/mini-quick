import P from '../../modules/quick'
import { getIndexRenderData } from '../../modules/utils'


// 页面名称需要与数据源中的配置保持一致
P('index', {
  onReady() {
    // 预加载hot页面首屏
    this.$preload('hot')
  },
  onPageDataPreloadCallback(res) {
    let [err, busData] = res
    if (err || !busData.data || !busData.data.data) return
    let state = getIndexRenderData(busData.data.data)
    return {
      state,
      origin: busData.data
    }
  },
  onPageDataFirstScreenCallback(res) {
    let [err, busData] = res
    let list = busData.data && busData.data.data
    if (list) {
      return {
        state: getIndexRenderData(list),
        origin: busData.data  // 保留的这个数据是方便后续翻页、数据上报等用的
      }
    }
    // 可根据err对象做错误处理
    this.setData({
      errMsg: '发生错误'
    })
  },
  onPageDataPagingCallback(res) {
    let [err, busData] = res
    let list = busData.data && busData.data.data
    let origin = this.$getOrigin()
    busData.data.data = [...list, ...origin.data]
    if (list) {
      return {
        state: [...this.data.state, ...list],
        origin: busData.data
      }
    }
    // 翻页失败
  },
  onBeforePaging() {
    let origin = this.$getOrigin()
    return {
      data: {
        pageContext: origin.pageContext || 'num=1'
      }
    }
  }
})
