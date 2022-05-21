const {
    join
} = require('path');
const fs = require('fs');
const Parser = require('./Parser');
const {
    writeFileSync
} = require('fs');
const {
    getSource
} = require('babel-traverse/lib/path/introspection');
class Compilation {
    constructor(compiler) {
        const {
            options,
            modules
        } = compiler;
        this.options = options;
        this.modules = modules;
    }
    seal() {
        this.buildModule();
    }
    // loader 
    getSource(modulePath) {
        let source = fs.readFileSync(modulePath, 'utf8');
        //TODO：loader的处理逻辑写在这里，后面会提到
        //获取webpack.config.js中的rules
        let rules = (this.options.module && this.options.module.rules) || [];
        var that = this;

        //遍历rules调用loader
        for (let i = 0; i < rules.length; i++) {
            let rule = rules[i];
            // 用rule的test中正则匹配文件的类型是否需要使用laoder
            if (rule.test.test(modulePath)) {
                //获取rule中的loaders，例如['style-laoder','css-loader']
                let loaders = rule.use;
                let length = loaders.length; //loader的数量 
                let loaderIndex = length - 1; // 往右向左执行

                // loader遍历器
                function iterateLoader() {
                    let loaderName = loaders[loaderIndex--];
                    //loader只是一个包名，需要用require引入
                    let loader = require(join(that.root, 'node_modules', loaderName));
                    //使用loader，可以看出loader的本质是一个函数
                    source = loader(source);
                    if (loaderIndex >= 0) {
                        iterateLoader();
                    }
                }

                //遍历执行loader
                iterateLoader();
                break;
            }
        }
        return source;
    }
    buildModule(filename, isEntry) {
        let absolutePath = '';
        let source = '';
        let ast = '';
        if (!isEntry) {
            absolutePath = join(process.cwd(), "./src", filename)
            source = this.getSource(absolutePath);
            ast = Parser.ast(source)
        } else {
            source = this.getSource(filename);
            ast = Parser.ast(source)
        }

        //通过index.js 的ast 树 节点获取index文件依赖
        const dependencies = Parser.getDependency(ast);
        const code = Parser.transform(ast);
        // console.log(code, '生成code')
        // console.log('ast', ast)
        return {
            filename,
            id: Math.random(),
            dependencies,
            code,
        }
    }

    emitFiles() {
        let _modules = "";
        const outputPath = join(
            this.options.output.path,
            this.options.output.filename
        );
        this.modules.map((_module) => {
            _modules += `'${_module.id}':function(module,exports,require){
                ${_module.code}
              },
            `;
        })
        const tempalte = `(function (modules) {
            var installedModules = {};
            function __webpack_require__(moduleId) {
              // Check if module is in cache
              if (installedModules[moduleId]) {
                return installedModules[moduleId].exports;
              }
              // module.exports = {};
              var module = (installedModules[moduleId] = {
                exports: {},
              });
              modules[moduleId].call(
                module.exports,
                module,
                module.exports,
                __webpack_require__
              );
              return module.exports;
            }
            return __webpack_require__('${this.options.entry}');
          })({
            ${_modules}
          });
          `;
        console.log(outputPath, "outputPath-outputPath");
        writeFileSync(outputPath, tempalte, 'utf8');

    }
}

module.exports = Compilation;