// 组件通信，一个触发与监听的过程
class EventEmitter {
    constructor() {
            // 存储事件
            this.events = this.events || new Map()
        }
        // 监听事件
    addListener(type, fn) {
            if (!this.events.get(type)) {
                this.events.set(type, fn)
            }
        }
        // 触发事件
    emit(type) {
        let handle = this.events.get(type)
        handle.apply(this, [...arguments].slice(1))
    }
}

// 测试
// let emitter = new EventEmitter()
//     // 监听事件
// emitter.addListener('ages', age => {
//         console.log(age)
//     })
//     // 触发事件
// emitter.emit('ages', 18) // 18

//斐波那契

function fb(n, n1 = 1, n2 = 2) {
    if (n <= 1) {
        return 1;
    }
    return fb(n - 1, n2, n1 + n2)
}
// function serach(arr, x) {
//     let low = 0,
//         height = arr.length - 1;
//     while (low < height) {
//         let base = Math.floor(height / 2);
//         if (x < arr[base]) {
//             height = base - 1;
//         } else if (x > arr[base]) {
//             low = base + 1;
//         } else if (x === arr[base]) {
//             return base;
//         } else {
//             return -1;
//         }
//     }

// }
// serach([1, 2, 3, 4, 8, ], 3)