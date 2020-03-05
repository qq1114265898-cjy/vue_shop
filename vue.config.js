module.exports={
  chainWebpack:config=>{
    // 发布模式
    config.when(process.env.NODE_ENV === 'production', config=>{
      config.entry('app').clear().add('./src/main-prod.js')
      // 指定不需要合并打包的依赖 避免依赖项文件过大
      config.set('externals', {
        vue:'Vue',
        'vue-router':'VueRouter',
        axios:'axios',
        lodash:'_',
        echarts:'echarts',
        nprogress:'nProgress',
        'vue-quill-editor':'VueQuillEditor'
      })
      // 根据isProd值来确定如何渲染首页
      config.plugin('html').tap(args=>{
        args[0].isProd = true
        return args
      })
    })
    // 开发模式
    config.when(process.env.NODE_ENV === 'development', config=>{
      config.entry('app').clear().add('./src/main-dev.js')

      config.plugin('html').tap(args=>{
        args[0].isProd = false
        return args
      })
    })
  }
}