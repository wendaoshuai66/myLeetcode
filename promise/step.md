# 手写 Promise 最前敲三遍

## Promise

1. state 存放当前状态
2. val 存放当前状态的值
3. then 方法 返回值也是一个 Promise
4. catch 方法
5. finally
6.  静态方法， 如： Promise.all、 Promise.reslove


## 实战案列

1. 实现一个 promise ，在setTimeout 中去 resolve
2. 实现一个 promise 直接同步resolve
3. 步骤3 实现一个 promise 防止 resolve 多次，通过判断  this.state === PENDING 只有 PENDING 才会进入
4. 步骤4 实现一个promise 可以让then 方法链式调用
5. 步骤5实现一个 promise ，支持空的 then 函数
6. 步骤6 实现一个promise 支持thenable 对象  判断 then 传入的方法执行出来的是否是thenable 对象
7. 步骤7 实现一个promise ，支持then 传递 promise 对象, 判断 是否是myPromise
8. 步骤8 实现一个promise ，resolve 传递 promise  判断 resolve 传进去的是否为 typeof val === "object" || typeof val === 'function' ，是的话直接执行
9. 步骤9 实现一个promise 处理then 中的 循环 promise
10. 步骤10 Promise.all
11. 步骤11 支持 rejected catch
12. 步骤12 ， 同时执行 两次 promise.then, 支持完成态 或失败态
