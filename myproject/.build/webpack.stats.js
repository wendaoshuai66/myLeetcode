/**
 * @Desc  webpack stats
 */

module.exports = env => {
    if (env.IS_PRODUCTION) {
        return 'normal';
    } else {
        return {
            modules: false,
            assets: false,
            chunks: false,
            children: false,
            reasons: true,
            errors: true,
            warnings: true,
        };
    }
};