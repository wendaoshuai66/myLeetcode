/**
 * @Desc  返回公共的 rules 配置
 */

const {
    getDefinedData,
    getOutputRoot,
    getConfigFile
} = require('./webpack.util');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const WebpackNotifierPlugin = require('webpack-notifier');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const SimpleProgressWebpackPlugin = require('simple-progress-webpack-plugin');

const getCleanWebpackPlugin = (env, config, distRoot, distFolder) => {
    // if (env.IS_PRODUCTION) {
    //     return new CleanWebpackPlugin([`${distRoot}/${distFolder}`], {
    //         root: process.cwd(),
    //     });
    // } else {
    //     const configFile = getConfigFile(env);
    //     const cleanPathList = [];
    //     const unitConfigs = configFile.webpackConfigs;

    //     Object.keys(unitConfigs).forEach((key) => {
    //         cleanPathList.push(`${distRoot}/${distFolder}/${key}`);
    //     });

    //     return new CleanWebpackPlugin(cleanPathList, {
    //         root: process.cwd(),
    //     });
    // }
    const configFile = getConfigFile(env);
    const cleanPathList = [];
    const unitConfigs = configFile.webpackConfigs;
    console.log(unitConfigs, 'unitConfigs--')
    Object.keys(unitConfigs).forEach((key) => {
        cleanPathList.push(`${distRoot}/${distFolder}/${key}`);
    });

    return new CleanWebpackPlugin(cleanPathList, {
        root: process.cwd(),
    });
}

module.exports = (env, config) => {
    const IS_PRODUCTION = env.IS_PRODUCTION;
    const definedData = getDefinedData(env);
    const distFolder = `${env.system.toLowerCase()}`;
    const distRoot = getOutputRoot(env);

    const cleanWebpackPlugin = getCleanWebpackPlugin(env, config, distRoot, distFolder);

    let plugins = [
        ...(IS_PRODUCTION ? [] : env.progress ? [new SimpleProgressWebpackPlugin()] : []),
        new webpack.DefinePlugin(definedData),
        new webpack.ProvidePlugin({
            $: 'zepto',
            BJ_REPORT: 'BJ_REPORT',
        }),
        cleanWebpackPlugin,
        new ForkTsCheckerWebpackPlugin(),
        new ExtractTextPlugin({
            filename: IS_PRODUCTION ? '[name]/[name].[hash:8].css' : '[name]/[name].css',
            allChunks: true,
        }),
    ];

    if (IS_PRODUCTION && env.ak) {
        console.log(11)
    } else {
        plugins.push(
            new CopyWebpackPlugin([{
                from: '_doc/**',
                to: `../${distFolder}/`,
                toType: 'dir',
                context: 'src/',
            }, ]),
        );
    }

    if (env.debug) {
        plugins.push(
            new BundleAnalyzerPlugin({
                analyzerMode: 'static',
                openAnalyzer: false,
                generateStatsFile: true,
            }),
        );
    }
    if (env.n) {
        plugins.push(new WebpackNotifierPlugin());
    }
    // if (!IS_PRODUCTION) {
    //     plugins.forEach(plugin => {
    //         if ('ForkTsCheckerWebpackPlugin' === plugin.constructor.name) {
    //             plugin.memoryLimit = 4096;
    //         }
    //     });
    // } else {
    //     plugins.forEach(plugin => {
    //         if ('ForkTsCheckerWebpackPlugin' === plugin.constructor.name) {
    //             plugin.memoryLimit = 4096;
    //         }
    //     });
    // }

    return plugins;
};