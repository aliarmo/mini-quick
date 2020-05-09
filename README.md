## 简介
一个超轻量的高性能小程序框架，可以自动缓存接口数据，容灾，预加载等，代理首屏请求。
首先明确两个概念
页面数据：打开一个页面所呈现的主要数据
首屏数据：页面数据的第一页

## 解决的问题
1. 在后面介绍的三个钩子函数里，开发者可以从后台返回数据中挑出渲染所需state，避免不必要setData，提升页面渲染性能
2. 统一缓存接口请求成功数据，失败时自动使用缓存数据
3. 预加载其他的页面数据，如其他tab页面数据，实现页面秒开
4. 封装预加载所带来的复杂数据处理逻辑
5. 使用缓存数据渲染首屏，再去拉取接口，diff更新首屏数据，适用于数据不经常变更页面

## 接入方式，[详细demo]()
1. npm i mini-quick
2. 创建一个数据配置文件，假设在./modules/request-config
下面这样写所表达的意思是index这个页面，有两个数据源，首屏first_screen_name和like，框架会自动请求首屏数据
```
import { first_screen_name } from 'mini-quick';
export default {
  index: {
    // 首屏数据源的名称必须要是这个first_screen_name，非首屏的任意命名
    [first_screen_name]: {
      url: 'https://access.video.qq.com/tinyapp/hot_video_nav?vappid=65939066&vsecret=07c58e0c93150c4254a2a24131574b94cab6142ba4210efa&vversion_name=5.2.0.1234&vplatform=5&tabId=2',
      // 请求参数处理，这里返回的参数直接给到wx.request，支持promise
      fixBefore(busParam) {
        // 可对业务传入的busParam做进一步处理
        return Promise.resolve({
          header: {
            "Cookie": "name=mbj; age=18"
          },
          isPersistent: true    // 框架会缓存接口每次返回的结果，默认缓存在内存，加上这个配置，缓存在storage
        })
      },
      // 对返回数据的处理，fixAfter接受的是wx.request请求成功返回的数据
      fixAfter(res) {
        let data = res.data
        if (typeof data == 'string') {
          data = data.replace(/^data\s*=/, '')
          try {
            data = JSON.parse(data)
          } catch (err) {
            data = {}
          }
        }
        res.data = data
        // 返回一个数组，第一项表示错误信息，第二是业务数据，有错误信息，框架会走到onError，自动拿缓存的数据返回
        return [true ? null : { errCode: 10001, errMsg: 'special error' }, res]
      },
      // 处理错误信息，同样返回一个数组，第一项为错误信息
      onError(err){
        return [err]
      }
    },
    like:{
      url:'点赞接口地址'
    }
  }
}
```
3. 项目的app.js里面注册请求配置
```
import { register } from 'mini-quick'
import config from './modules/request-config'
register(config)
```
4. 注册页面
```
import P from 'mini-quick'

// 页面名称，跟request-config对应
P('index', {
  isCacheFirstScreen:true, // storage中缓存页面首屏，下次进入这个页面，如果没有预加载数据，则使用缓存数据先渲染，在去拉取新数据
  data: {
  },
  onLoad() {

  },
  onReady() {
    // 预加载其他页面首屏数据，会用logs1这个页面的数据源首屏配置，可秒开logs1页面，因为不需要等待首屏请求即可渲染
    this.$preload('logs1')
  },
  // 预加载数据钩子，可处理预加载其他页面首屏数据，比如其他tab，将获取的数据提取出必要的渲染部分存放在state里面，源数据存放在origin中，便于翻页、数据上报等，不可使用this.setData，返回的state后续会被setData({state})，origin可以通过this.$getOrigin取到
  onPageDataPreloadCallback(data) {
    console.log("onPageDataPreloadCallback", data)
    let err = data[0]
    let busData = data[1] // 完整的业务数据，强烈建议提取出必要的渲染部分
    if (err) return
    let state=getRenderPart()
    return {
      state,
      origin:busData,
    }
  },
  // 首屏钩子，处理首屏数据，可使用this.setData
  onPageDataFirstScreenCallback(data) {
    console.log("onPageDataFirstScreenCallback", data)
    let err = data[0]
    let busData = data[1]
    if(err){
      return {
        state: {
          errCode: busData.errCode||1009  // 可使用接口返回错误码
        },
        origin: busData
      }
    }
    let state=getRenderPart()
    return {
      state,
      origin:busData,
    }
  },
  // 如果首屏后页面数据还有翻页，翻页钩子，可用于处理翻页数据，如将翻页数据列表拼接到原来的state中
  onPageDataPagingCallback(data) {
    console.log("onPageDataPagingCallback", data)
    let err = data[0]
    if (err) return
    let busData = data[1]
    let former = this.data.state.scheduleList
    let after = busData.data.data.scheduleList
    after = [...former, ...after]
    // 翻页数据列表拼接到原来state中
    this.setData({
      [`state.scheduleList`]: after
    })
    return {
      origin: busData.data
    }
  },
  // 返回翻页函数所需要的参数，提供了一个$paging函数供页面数据翻页，可直接bindtap="$paging"
  onBeforePaging() {
    let origin = this.$getOrigin()  // 接口返回的源数据
    return {
      data: {
        pageContext: origin.pageContext || 'num=1'
      }
    }
  },
  // 自定义页面数据请求，会覆盖框架定义的页面数据请求函数
   $requestPageData() {
     return new Promise(resolve => {

   }
})
```
至此，在页面模板中就可以使用state这个数据了，如：
```
<view>{{state}}</view>
```
## API
```
import {P, register, requestFactory, first_screen_name}
```
1. 页面构造函数P(name: string,options: object)
  -- name，页面名称
  -- options，页面配置，通微信的Page，下面介绍下options里需要开发者实现的配置
      -- [必须实现]onPageDataPreloadCallback<function>，预加载数据钩子，可处理预加载其他页面首屏数据，不可使用this.setData，比如其他tab，返回值格式为null或者如下：
          ```
          {
            state:需要渲染的数据，这个数据会被setData
            origin:保留的必要数据，比如翻页上下文，数据上报参数等，这个数据可通过this.$getOrigin()取到
          }
          ```
      -- [必须实现]onPageDataFirstScreenCallback<function>，首屏钩子，处理首屏数据，可使用this.setData，返回值同onPageDataPreloadCallback
      -- onPageDataPagingCallback<function>，如果首屏后页面数据还有翻页，翻页钩子，可用于处理翻页数据，如将翻页数据列表拼接到原来的state中，返回值同onPageDataPreloadCallback
      -- onBeforePaging<function>，返回翻页函数所需要的参数，框架提供了一个$paging函数供页面数据翻页，可直接bindtap="$paging"
      -- $requestPageData<function>，自定义页面数据请求，会覆盖框架定义的页面数据请求函数，返回一个promise
      -- isCacheFirstScreen<boolean>，true，则在storage中缓存页面首屏，下次进入这个页面，如果没有预加载数据，则使用缓存数据先渲染，在去拉取新
2. 实例方法
  -- $getOrigin，获取钩子函数中返回的origin数据
  -- $onPreload(name: string)，预加载页面名称为name的页面数据，最佳实践，可以在当前页面的onReady中进行预加载
  -- $requestPageData，页面数据请求方法，不建议直接调用这个方法
  -- $retry(extraParam: object)，页面数据重试方法，框架内部也是调用$requestPageData
  -- $paging，页面数据翻页方法，框架内部也是调用$requestPageData
  -- $request(interfaceName: string, extraParam: object)，数据请求方法，传入接口配置时的名称，接口所需要的参数
3. register(config: object)，数据源配置方法，**框架自动缓存fixAfter处理后的数据，走到onError，会使用缓存的数据返回**
```
{
  // 页面名称
  index:{
    // 该页面下的一个接口，this.$request所需要的interfaceName
    interfaceName1:{
      url:'接口地址',
      // 请求参数处理，这里返回的参数直接给到wx.request，支持promise
      fixBefore(extraParam){
        return Promise.resolve({
          data:{},
          header: {
            "Cookie": "name=mbj; age=18"
          },
          isPersistent: true    // 框架会缓存接口每次返回的结果，默认缓存在内存，加上这个配置，缓存在storage
        })
      },
      // 对返回数据的处理，fixAfter接受的是wx.request请求成功返回的数据
      //
      fixAfter(res) {
        console.log("res",res)
        // 返回一个数组，第一项表示错误信息，第二是业务数据，有错误信息，框架会走到onError，自动拿缓存的数据返回
        return [null, res]   // 正常返回，res会被缓存到storage
        return [{ errCode: 10001, errMsg: 'special error' }]  // 有错误信息，框架会走到onError，自动拿缓存的数据返回
      },
      // 处理错误信息，同样返回一个数组，第一项为错误信息
      onError(err){
        return [err]
      }
    }
  }
}
```
4. first_screen_name，在写数据源配置时，页面数据的约定名称，必须要使用这个名称
5. requestFactory(name: string, interfaceName: string, extraParam: object)，数据请求器，用于请求指定页面的指定接口，this.$request内部调用的就是这个方法

## TODO
1. 找个合适的设计模式在来看下是否可以在抽象一层出来，现在感觉还是有重复
2. 支持插件机制
