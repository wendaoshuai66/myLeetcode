const Compiler = require('./Compiler');
const options = require('../lspack.config');
const plugins = options.plugins;
const compiler = new Compiler(options);

for (const plugin of plugins) {
    plugin.apply(compiler);
}
compiler.run()