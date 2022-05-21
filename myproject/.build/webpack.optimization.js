/**
 * splitChunks.maxAsyncRequestsnumber = 30  按需加载时的最大并行请求数。
 * splitChunks.maxInitialRequests number = 30 入口点的最大并行请求数。
 * splitChunks.minSizenumber = 20000 {
     [index: string]: number} 生成 chunk 的最小体积（ 以 bytes 为单位）
 * @Desc  webpack optimization
 */
module.exports = (env) => {
    return {
        removeAvailableModules: false, // 如果模块已经包含在所有父级模块中，告知 webpack 从 chunk 中检测出这些模块，或移除这些模块。将 optimization.removeAvailableModules 设置为 true 以启用这项优化。在 production 模式 中默认会被开启。
        removeEmptyChunks: false, //如果 chunk 为空， 告知 webpack 检测或移除这些 chunk。 将 optimization.removeEmptyChunks 设置为 false 以禁用这项优化。
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendor', //提供字符串或函数使你可以使用自定义名称。指定字符串或始终返回相同字符串的函数会将所有常见模块和 vendor 合并为一个 chunk。这可能会导致更大的初始下载量并减慢页面加载速度
                    chunks: 'all', // string = 'async' 有效值为 all，async 和 initial。设置为 all 可能特别强大，因为这意味着 chunk 可以在异步和非异步 chunk 之间共享
                    priority: -10, // number = -20
                },
                common: {
                    test: /src[\\/]common[\\/]/,
                    name: 'common',
                    chunks: 'all',
                    priority: -20,
                },
                businessCommon: {
                    test: /[\\/]businessCommon[\\/]/,
                    name: 'businessCommon',
                    chunks: 'all',
                    priority: -30,
                    enforce: true, // 告诉 webpack 忽略 splitChunks.minSize、splitChunks.minChunks、splitChunks.maxAsyncRequests 和 splitChunks.maxInitialRequests 选项，并始终为此缓存组创建 chunk。
                },
            },
        },
    };
};