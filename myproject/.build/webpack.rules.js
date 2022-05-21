/**
 * @Desc  返回公共的 rules 配置
 */

const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const {
    getAssetName,
    getPreprocessRule,
    getRootDir
} = require('./webpack.util');

module.exports = (env, config, baseDir = 'src') => {
    const IS_PRODUCTION = env.IS_PRODUCTION;
    const preprocessRule = getPreprocessRule(env);

    const include = [
        path.resolve(__dirname, '../src'),
        ...(baseDir != 'src' ? [path.resolve(__dirname, `../${baseDir}`)] : []),
    ];

    return [{
            test: /\.(html|dwt)$/,
            exclude: /(_doc)/,
            use: [{
                loader: 'html-loader',
                options: {
                    interpolate: true
                }
            }, preprocessRule],
        },
        {
            test: /\.(t|j)sx?$/,
            include,
            use: [{
                    loader: 'ts-loader',
                    options: {
                        transpileOnly: true,
                        experimentalWatchApi: true,
                    },
                },
                preprocessRule,
            ],
        },
        {
            test: /\.tsx?$/,
            include,
            enforce: 'pre',
            use: [{
                loader: 'tslint-loader',
                options: {
                    failOnHint: true,
                },
            }, ],
        },
        {
            test: /\.css$/,
            include,
            use: ExtractTextPlugin.extract({
                use: [{
                        loader: 'css-loader',
                        options: {
                            minimize: IS_PRODUCTION ? true : false,
                            sourceMap: IS_PRODUCTION ? false : true,
                            importLoaders: 2,
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss-css',
                            sourceMap: IS_PRODUCTION ? false : true,
                        },
                    },
                    preprocessRule,
                ],
                fallback: 'style-loader',
            }),
        },
        {
            test: /\.scss$/,
            include,
            use: ExtractTextPlugin.extract({
                use: [{
                        loader: 'css-loader',
                        options: {
                            minimize: IS_PRODUCTION ? true : false,
                            sourceMap: IS_PRODUCTION ? false : true,
                            importLoaders: 4,
                        },
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss-sass',
                            sourceMap: IS_PRODUCTION ? false : true,
                        },
                    },
                    preprocessRule,
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: IS_PRODUCTION ? false : true,
                        },
                    },
                    // {
                    //     loader: '@umu/scss-namespace-loader',
                    //     options: {
                    //         classSelector: '',
                    //         include: [
                    //             'src/businessCommon/components/',
                    //             'src/@platformCommon/',
                    //             'src/common/components/',
                    //         ],
                    //     },
                    // },
                    // {
                    //     loader: 'sass-resources-loader',
                    //     options: {
                    //         sourceMap: IS_PRODUCTION ? false : true,
                    //         resources: [`${getRootDir()}/src/common/styles/variables.scss`],
                    //     },
                    // },
                    {
                        loader: '@epegzz/sass-vars-loader',
                        options: {
                            syntax: 'scss',
                            files: [getRootDir() + config.THEME],
                        },
                    },
                ],
                fallback: 'style-loader',
            }),
        },
        {
            test: /\.(jpg|jpeg|gif|png)$/,
            include,
            use: [{
                loader: 'url-loader',
                options: {
                    limit: 1024,
                    name: (file) => {
                        return getAssetName(file, 'images', IS_PRODUCTION, baseDir);
                    },
                },
            }, ],
        },
        {
            test: /\.(woff|woff2|eot|ttf|svg)$/,
            include,
            use: [{
                loader: 'url-loader',
                options: {
                    limit: 1024,
                    name: (file) => {
                        return getAssetName(file, 'fonts', IS_PRODUCTION, baseDir);
                    },
                },
            }, ],
        }
    ];
};