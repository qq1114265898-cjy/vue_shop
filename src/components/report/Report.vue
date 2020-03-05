<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 1、为echarts准备一个容器Dom -->
      <div id="main" style="width:800px; height:400px"></div>
    </el-card>
  </div>
</template>

<script>
import echarts from 'echarts'
import _ from 'lodash'
export default {
  name: '',
  data() {
    return {
      // 需要合并的配置
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  mounted() {
    // 2、渲染完毕之后才能初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'))
    // 3、准备数据和配置项
    this.$http.get('reports/type/1').then(res => {
      console.log(res)
      const mergeOptions = _.merge(this.options, res.data.data)
      if (res.data.meta.status !== 200) {
        return this.$messgae.error(res.data.meta)
      }
      // 4、渲染图表
      myChart.setOption(mergeOptions)
    })
    // console.log(options)
    // console.log(myChart)
  }
}
</script>

<style scoped>
</style>
