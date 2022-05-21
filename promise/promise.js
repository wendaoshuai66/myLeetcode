/**
 * promise A+ 的实现效果 
 */
const PENDING = 'PENDING';
const FUILED = 'FUILED';
const REJECT = 'REJECT';

function processSolution(promise2, x, resolve, reject) {
    if (typeof x === 'object' && x === promise2) {
        throw new Error('循环引用了')
    }
    if (x instanceof MyPromise) {
        if (x.state === PENDING) {
            x.then((r) => {
                resolve(r)
            })
        } else {
            x.state === FUILED && resolve(x.val)
            x.state === REJECT && reject(x.val)
        }
    }
    if ((typeof x === 'object' || typeof x === 'function') && x !== null) {
        if (typeof x.then === 'function') {
            x.then((r) => {
                resolve(r)
            }, (err) => {
                reject(err)
            })
        } else {
            processSolution(promise2, x, resolve, reject)
        }
    } else {
        resolve(x)
    }
}
class MyPromise {
    constructor(fn) {
        this._resolves = [];
        this._rejects = [];
        this.val = null;
        this.state = PENDING;
        const resolve = (val) => {
            if ((typeof val === "object" || typeof val === 'function') && val.then) {
                return processSolution(this, val, resolve, reject)
            }
            setTimeout(() => {
                if (this.state === PENDING) {
                    this.state = FUILED;
                    this.val = val;
                    this._resolves.map(fn => {
                        fn()
                    })
                }
            })
        }
        const reject = (val) => {
            if (this.state === PENDING) {
                this.state = REJECT;
                this.val = val;
                this._rejects.map(fn => {
                    fn()
                })
            }
        }
        fn(resolve, reject)
    }
    static resolve(val) {
        return new MyPromise(resolve => {
            resolve(val)
        })
    }
    static all(promiseArray) {
        return new MyPromise((resolve, reject) => {
            let resultArr = [];
            let resultTime = 0;

            function processResult(index, data) {
                resultArr[index] = data;
                resultTime++;
                if (resultTime === promiseArray.length) {
                    resolve(resultArr)
                }
            }
            for (let i = 0; i < promiseArray.length; i++) {
                promiseArray[i].then((result) => {
                    processResult(i, result)
                }, (err) => {
                    reject(err)
                })
            }
        })
    }
    then(onFuiled = (val) => val, onRejected = (err) => {
        throw new Error(err)
    }) {
        let promise2;
        if (this.state === FUILED) {

            promise2 = new MyPromise((resolve, reject) => {
                const x = onFuiled(this.val)
                processSolution(promise2, x, resolve, reject)
            })
        }

        if (this.state === REJECT) {

            promise2 = new MyPromise((resolve, reject) => {
                const x = onRejected(this.val)
                processSolution(promise2, x, resolve, reject)
            })
        }
        if (this.state === PENDING) {
            promise2 = new MyPromise((resolve, reject) => {
                this._resolves.push(() => {
                    const x = onFuiled(this.val)
                    processSolution(promise2, x, resolve, reject)
                })
            })
        }
        return promise2;

    }
}
// 1.异步执行

// new MyPromise(resolve => {
//     setTimeout(() => {
//         resolve('step1')
//     })
// }).then(res => {
//     console.log(res)
// })

// 2. 同步执行

// new MyPromise(resolve => {
//     resolve('step1')
// }).then(res => {
//     console.log(res)
// })

// 3. resolve 多次执行, 添加状态

// new MyPromise(resolve => {
//     resolve('step1')
//     resolve('step2')
// }).then(res => {
//     console.log(res)
// })

// 4. 添加 then 的链式，返回新的 Promise

// new MyPromise(resolve => {
//     resolve('step4.1')
// }).then(res => {
//     console.log(res)
//     return res;
// }).then(res => {
//     console.log(res, '链式的')
// })

// 5. 支持then 空函数
// new MyPromise(resolve => {
//     resolve('step5.1')
// }).then().then(res => {
//     console.log(res, '链式的')
// })

// 6. 支持then 中返回thenable

// new MyPromise(resolve => {
//     resolve('step5.1')
// }).then((val) => {
//     console.log('第一次接受到数据', val)
//     return {
//         then(r) {
//             r('step6.1')
//         }
//     }
// }).then(res => {
//     console.log(res, '链式的')
// })

// 7. 支持then 中返回 新的 promise

// new MyPromise(resolve => {
//     resolve('step7.1')
// }).then((val) => {
//     console.log('第一次接受到数据', val)
//     return new MyPromise((resolve) => {
//         resolve('step7.2')
//     })
// }).then(res => {
//     console.log(res, '链式的')
// })

//  8. 支持reslove 中注入 新的 promise

// new MyPromise(resolve => {
//     resolve(new MyPromise((resolve) => {
//         resolve('step7.2')
//     }))
// }).then((val) => {
//     console.log('第一次接受到数据', val)
// })

// 9. 循环引用

// const promise1 = new MyPromise(resolve => {
//     resolve('9')
// })
// const promise2 = promise1.then((data) => {
//     console.log('data', data)
//     return promise2;
// })

// 10. then 延迟执行了 支持完成态 或失败态

// const promise1 = new MyPromise(resolve => {
//     resolve('10')
// })

// setTimeout(() => {
//     promise1.then((data) => {
//         console.log(data)
//     })
// }, 1000)

//11 rejected
// const promise1 = new MyPromise((resolve, reject) => {
//     reject('10')
// }).then(() => {}, (err) => {
//     console.log(err)
// })

//11 promise.all

MyPromise.all([MyPromise.resolve(1), MyPromise.resolve(2)]).then(datalist => {
    console.log(datalist, '---datalist--')
})