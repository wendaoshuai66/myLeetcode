const babylon = require('babylon');
const travers = require('babel-traverse').default;
const {
    transformFromAst
} = require('@babel/core')
const fs = require('fs');

class Parser {
    static ast(source) {
        // const content = fs.readFileSync(path, 'utf-8');
        return babylon.parse(source, {
            sourceType: 'module',
        })
    }
    static getDependency(ast) {
        const dependencies = [];
        travers(ast, {
            ImportDeclaration: ({
                node
            }) => {
                dependencies.push(node.source.value)
            }
        })
        return dependencies;
    }

    static transform(ast) {
        const {
            code
        } = transformFromAst(ast, null, {
            presets: ['@babel/preset-env']
        })
        return code;
    }
}
module.exports = Parser;