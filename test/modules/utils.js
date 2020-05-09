export function getIndexRenderData(list) {
  return list.map(item => {
    // 后台接口返回了很多数据，渲染用得上的只有这两个字段而已
    return {
      query: item.query,
      order: item.order
    }
  })
}


export function getHotRenderData(list) {
  return list.map(item => {
    return {
      name: item.album_name,
      score: item.sns_score,
      categories: item.categories.map(i => {
        return {
          name: i.name
        }
      })
    }
  })
}
