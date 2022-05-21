const {
    SyncHook
} = require('tapable');
const Compilation = require('./Compilation');
class Compiler {
    constructor(options) {
        this.modules = [];
        this.options = options;
        this.hooks = {
            run: new SyncHook(['compilation']),
        }
    }
    run() {
        const onComplete = (err, compilation) => {}
        this.compile(onComplete)
    }
    compile(callback) {
        const compilation = this.newCompilation();
        // 触发钩子的执行
        this.hooks.run.call(compilation);
        // 通过entry 找入口文件
        const entryModule = compilation.buildModule(this.options.entry, true);
        this.modules.push(entryModule);
        // 单入口和多入口
        this.modules.map((_module) => {
            _module.dependencies.map((dependencies) => {
                this.modules.push(compilation.buildModule(dependencies, false))
            })
        })
        console.log(this.modules, '---/Users/wendaoshuai/Desktop/leadCode/record/simple-webpack/src--')
        compilation.emitFiles()
    }

    newCompilation() {
        const compilation = this.createCompilation();
        return compilation;
    }
    createCompilation() {
        return new Compilation(this);
    }
}

module.exports = Compiler;

// 