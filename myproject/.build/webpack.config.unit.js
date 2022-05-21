const appRoot = process.cwd();
const {
    getDefinedData,
    getOutputDir
} = require('./webpack.util');
const fs = require('fs')
const HtmlWebpackPlugin = require('html-webpack-plugin');

function findEntry(path) {
    let exts = ['ts', 'tsx'];
    for (let i = 0; i < exts.length; i++) {
        let ext = exts[i];
        let testPath = `${path}.${ext}`;
        if (fs.existsSync(testPath)) {
            path = testPath;
            break;
        }
    }
    return path;
}

function getUnitConfig(env, unitName, {
    unitFolderName = '',
    commonChunks,
    otherChunks = [],
    srcFolder = 'src'
}) {
    const definedData = Object.assign(getDefinedData(env), {
        RUN_TIME: 'php',
    });

    const outputDir = getOutputDir(env);
    let defaultChunks = ['vendor', 'common', 'businessCommon'];

    unitFolderName = unitFolderName ? unitFolderName + '/' : '';

    const isFast = env.isFast || false;
    const phpPages = env.phpPages || [];
    let htmlPluginOptions = {
        template: `./${srcFolder}/${unitFolderName}${unitName}/${unitName}.html`, // 模板的相对或绝对路径。默认情况下 src/index.ejs如果存在，它将使用。有关详细信息
        filename: appRoot + `/${outputDir}/${unitName}/${unitName}.html`,
        inject: false,
        chunks: (commonChunks ? commonChunks : defaultChunks).concat(otherChunks).concat([`${unitName}`]), //允许您仅添加一些块（ 例如， 仅单元测试块）
        chunksSortMode: 'manual',
        minify: env.IS_PRODUCTION ? {
            collapseInlineTagWhitespace: true,
            collapseWhitespace: true,
            processConditionalComments: true,
            minifyCSS: true,
            minifyJS: true,
            removeAttributeQuotes: true,
        } : false,
        data: definedData,
    };

    const plugins = [new HtmlWebpackPlugin(htmlPluginOptions)];
    return {
        entry: {
            [`${unitName}`]: findEntry(`./${srcFolder}/${unitFolderName}${unitName}/${unitName}`),
        },
        plugins: plugins,
    };
}
module.exports = {
    getUnitConfig
}