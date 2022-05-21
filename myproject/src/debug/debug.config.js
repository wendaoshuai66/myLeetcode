const {
    getUnitConfig
} = require('../../.build/webpack.config.unit');

const unitName = 'debug';

module.exports = (env) => {
    return getUnitConfig(env, unitName, {});
};