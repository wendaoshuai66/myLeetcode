
## 工作流程
1. 创建compiler new Compiler(options);， 将Compiler 注入到plugin apply方法中，
2.  调用compiler.run 方法 
3.  run 方法中 创建 new Compilation(this); 基于配置 开始创建chunk
4. compilation.buildModule ，从入口文件入手，使用Parser  从Chunk 开始解析依赖， fs.readFileSync 读取相应的文件， 通过 babylon 等相应解析为ast， 通过ast 获取相应的依赖
5. 使用module 和 dependencies 管理代码模块的相互关系，从单入口获取 module， 从module 中dependencies找相应的模块，逐渐递归
6.  使用 Template 基于 compilation的数据生成结果代码

## 相应的名词接解析

### Compiler
Compiler： webpack 的运行入口，Compiler 代表了webpack 完整的环境配置，包块entry，loader， plugin; Compiler 通过注入的方式到plugin 的apply，当插件收到时可以访问webpack 主环境

###Compilation

Compilation: 代表一次资源的构建，当运行webpack 开发环境，就会生成新的 Compilation， 从而生成一组新的编译资源

### Module


代码模块的基础类 ，代码块的所有信息都会存储到module 实例中，列入dependencies（记录代码模块的依赖） 等

创建一个 module 对象，主要操作：

搜集所有依赖的 module
执行对应的 loader

### Chunk

生成 Chunk 的两种方式：入口文件模块  动态引入的模块

### Parser。
基于 acorn 来分析 ast 语法树，解析出代码模块的依赖。




