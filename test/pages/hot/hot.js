import P from '../../modules/quick'
import { getHotRenderData } from '../../modules/utils'
P('hot', {

  /**
   * 页面的初始数据
   */
  data: {

  },
  onPageDataPreloadCallback(res) {
    let [err, data] = res
    console.log("onPageDataPreloadCallback", res)
    let busData = data.data
    if (err || !busData.data) return

    let state = getHotRenderData(busData.data)
    return {
      state,
      origin: busData
    }
  },
  onPageDataFirstScreenCallback(res) {
    let [err, data = {}] = res
    console.log("onPageDataFirstScreenCallback", res)
    let busData = data.data
    if (busData && busData.data) {
      let state = getHotRenderData(busData.data)
      return {
        state,
        origin: busData
      }
    }
    // 可根据err对象做错误处理
    this.setData({
      errMsg: '发生错误'
    })
  },
  onPageDataPagingCallback(res) {
    let [err, data] = res
    console.log("onPageDataPagingCallback", res)
    let busData = data.data
    if (err || !busData.data) return

    let state = getHotRenderData(busData.data)
    let origin = this.$getOrigin()
    busData.data = [...busData.data, ...origin.data]
    return {
      state: [...this.data.state, ...state],
      origin: busData
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
