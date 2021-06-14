/*
1.Node模块
1.1在CommonJS规范中一个文件就是一个模块
1.2在CommonJS规范中通过exports暴露数据
1.3在CommonJS规范中通过require()导入模块

2.Node模块原理分析
既然一个文件就是一个模块,
既然想要使用模块必须先通过require()导入模块
所以可以推断出require()的作用其实就是读取文件
所以要想了解Node是如何实现模块的, 必须先了解如何执行读取到的代码

3.执行从文件中读取代码
我们都知道通过fs模块可以读取文件,
但是读取到的数据要么是二进制, 要么是字符串
无论是二进制还是字符串都无法直接执行
*/   

const vm = require('vm')
const path = require('path')
const fs = require('fs')


class Module{
    constructor(id) {
        this.moduleId = id
        this.exports = {}
    }
}

Module._cache = {}
Module._extensions = {
    '.js': (module) => {
        //1. 读取绝对路径中文件中的内容
        const code = fs.readFileSync(module.moduleId)
        // 2.拼接包裹函数代码
        let strScript = Module.wrapper[0] + code + Module.wrapper[1]
        //3. 将字符串转换为js代码
        const jsScript = vm.runInThisContext(strScript)
        //4. 修改this指向为当前调用文件对象
        jsScript.call(module.exports, module.exports)
    },
    '.json': (module) => {
        //1. 读取文件内容
        const context = fs.readFileSync(module.moduleId)
        //2. 转化为对象
        const obj = JSON.parse(context)
        module.exports = obj
    }
}
Module.wrapper = [
    '(function (exports, require, module, __filename, __dirname) { ',
    '\n});'
];
function myModule(filePath) {
    //1. 将传入的相对路径转化为绝对路径                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
    const absPath = path.join(__dirname, filePath)
    // 2.尝试从当前缓存中获取模块
    const cacheModule = Module._cache[absPath]
    if (cacheModule) {
        return cacheModule.exports;
    }
    //3. 如果没有缓存就创建一个Module对象并缓存起来
    let module = new Module(absPath)
    Module._cache[absPath] = module
    // 4.利用tryModule的方法加载模块
    tryModuleLoad(module)
    return module.exports
}

function tryModuleLoad(module) {
    //1.取出模块后缀
    let extname = path.extname(module.moduleId)
    //2. 执行后缀对应的方法
    Module._extensions[extname](module)
}

let moduleObj = myModule('./event loop.js')
console.log(moduleObj);