/**
 * @Desc  编译配置
 */

const fs = require('fs');
const path = require('path');
const merge = require('webpack-merge');
const getRules = require('./webpack.rules');
const getPlugins = require('./webpack.plugins');
const getStats = require('./webpack.stats');
const getOptimization = require('./webpack.optimization');
const {
    getOutputDir,
    getVariantDir
} = require('./webpack.util');
// const GitRevisionPlugin = require('git-revision-webpack-plugin');
const createVariants = require('parallel-webpack').createVariants; // parallel-webpack允许您并行运行多个Webpack构建，从而将工作分散到各个处理器上，从而有助于显着加快构建速度
// const gitRevisionPlugin = new GitRevisionPlugin({
//     commithashCommand: 'rev-parse --short HEAD',
// });
const VERSION = 'export';
const {
    getConfigFile,
} = require('./webpack.util');

module.exports = (env, argv) => {
    env = env || {};
    let config = getConfigFile(env);

    const DEFAULT_SYSTEM = config.DEFAULT_SYSTEM;
    // 单元配置的处理
    const unitConfigs = config.webpackConfigs;

    env.system = (env.system || DEFAULT_SYSTEM).toUpperCase();
    const isFast = env.fast;

    // 获取语言变种
    const getVariants = (variant) => {
        let varians = [variant];
        if (variant.toLowerCase() == 'all') {
            varians = Object.keys(config.SYSTEMS);
        }
        if (variant.indexOf(',') > -1) {
            varians = variant.split(',').map((v) => {
                return v.toUpperCase();
            });
        }
        return varians;
    };

    const variants = {
        system: getVariants(env.system),
    };

    // 上线编译时去文件中拿一些敏感信息
    if (env.IS_PRODUCTION) {
        try {
            Object.assign(env, require(config.SECRECT_INFO));
        } catch (error) {
            //
        }
    }

    const createConfig = (env) => {
        let webpackConfig;
        const {
            system,
        } = env;

        const configEnv = Object.assign({}, env, {
            system,
            IS_PRODUCTION: env.IS_PRODUCTION ? true : false,
            VERSION: VERSION,
            isFast: isFast,
            phpPages: config.phpPages || [],
        });
        const commonConfig = {
            watchOptions: {
                poll: false,
                ignored: /node_modules/,
            },
            entry: {},
            node: {
                fs: 'empty',
            },
            plugins: getPlugins(configEnv, config),
            module: {
                // unknownContextCritical: false,
                // exprContextCritical: false,
                rules: getRules(configEnv, config),
            },
            resolve: {
                extensions: [' ', '.tsx', '.ts', '.js', '.json'], // ' '影响 sass 在 tsx 中的引入
                symlinks: false,
                modules: [
                    path.resolve(__dirname, './../src'), //影响 tsx 中 css 的引入
                    path.resolve(__dirname, './../node_modules'),
                ],
            },
            optimization: getOptimization(configEnv),
            stats: getStats(configEnv), // stats 选项让你更精确地控制 bundle 信息该怎么显示。 如果你不希望使用 quiet 或 noInfo 这样的不显示信息，而是又不想得到全部的信息，只是想要获取某部分 bundle 的信息，使用 stats 选项是比较好的折衷方式。
            parallelism: 200,
        };

        const distName = getVariantDir(configEnv);
        const distStaticPath = '../' + getOutputDir(configEnv);

        if (configEnv.IS_PRODUCTION) {
            webpackConfig = merge(commonConfig, {
                name: distName,
                mode: 'production',
                output: {
                    pathinfo: false,
                    filename: '[name]/[name].[chunkhash:8].js',
                    path: path.resolve(__dirname, `${distStaticPath}`),
                    publicPath: `${config.SYSTEMS[configEnv.system].CDN_HOST}/${config.APP_DIRECTORY}/${distName}`,
                },
            });
        } else {
            webpackConfig = merge(commonConfig, {
                name: distName,
                mode: 'development',
                devtool: isFast ? 'cheap-module-eval-source-map' : 'inline-source-map',
                recordsPath: path.join(__dirname, `${distStaticPath}/records.json`),
                output: {
                    pathinfo: false,
                    filename: '[name]/[name].bundle.js',
                    path: path.resolve(__dirname, `${distStaticPath}`),
                    publicPath: `/${config.APP_DIRECTORY}/${distName}`,
                },
            });
        }

        Object.keys(unitConfigs).forEach((key) => {
            let config = require(unitConfigs[key])(configEnv, argv);
            webpackConfig = merge(webpackConfig, config);
        });
        return webpackConfig;
    };

    return createVariants(env, variants, createConfig);
};