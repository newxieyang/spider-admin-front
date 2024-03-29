const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
    devServer: {
        host: '127.0.0.1',
        port: 80,
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8080',
                ws: true
            }
        }
    },


    // 打包时不生成.map文件 避免看到源码
    productionSourceMap: false,
    // 部署优化
    configureWebpack: {
        // 使用CDN
        // externals: {
        //     vue: 'Vue',
        //     'vue-i18n': 'VueI18n',
        //     axios: 'axios',
        //     'vue-router': 'VueRouter',
        //     vuex: 'Vuex',
        //     iview: 'iview',
        //     echarts: 'echarts',
        //     apexcharts: 'ApexCharts',
        //     'vue-apexcharts': 'VueApexCharts',
        //     xlsx: 'XLSX',
        //     dplayer: 'DPlayer',
        //     cgitalk: 'Gitalk'
        // },
        // GZIP压缩
        plugins: [
            new CompressionPlugin({
                test: /\.js$|\.html$|\.css/, // 匹配文件
                threshold: 10240 // 对超过10k文件压缩
            })
        ]
    }
}
