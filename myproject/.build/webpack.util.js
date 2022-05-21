const getDefinedData = (env) => {
    return {
        IS_PRODUCTION: env.IS_PRODUCTION,
        SYSTEM: JSON.stringify(env.system),
        DEBUG: !!env.debug,
        VERSION: JSON.stringify(env.VERSION),
    };
};

const getPreprocessContext = (env) => {
    return {
        IS_PRODUCTION: env.IS_PRODUCTION,
        SYSTEM: env.system,
        DEBUG: !!env.debug,
    };
};

const getPreprocessRule = (env) => {
    return {
        loader: 'preprocess-loader',
        options: {
            context: getPreprocessContext(env)
        },
    };
};
// 返回产出根目录
const getOutputRoot = (env) => {
    let config = {};
    if (env.config) {
        config = require(env.config);
    }
    return env.IS_PRODUCTION ? config.DIST_PROD || '_dist_prod' : config.DIST_DEV || '_dist_dev';
};
// 返回版本目录 example: cn
const getVariantDir = (env) => {
    return `${env.system.toLowerCase()}`;
};

// 当前产出的目录 example: /_dist_dev/cn
const getOutputDir = (env) => {
    return `./${getOutputRoot(env)}/${getVariantDir(env)}/`;
};
const getRootDir = () => {
    return process.env.PWD;
};
const getAssetName = (file, type, IS_PRODUCTION, src = 'src') => {
    let outPath = file.match(/(?:src|thirdPartySrc)\/(@?([a-zA-Z0-9]+))?\/(@([a-zA-Z0-9]+))?/);
    let unitFolder = outPath[2];
    if (outPath.length === 5 && outPath[4]) {
        unitFolder = outPath[4];
    }
    return `/${unitFolder}/images/[name].[hash:8].[ext]`;
};
const getConfigFile = (env, branch) => {
    let config = {};

    config = require('../config.local');
    return config;
}
module.exports = {
    getDefinedData,
    getConfigFile,
    getOutputRoot,
    getVariantDir,
    getOutputDir,
    getPreprocessRule,
    getRootDir,
    getAssetName
}