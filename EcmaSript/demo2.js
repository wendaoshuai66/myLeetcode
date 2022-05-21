// this.a = 20;

// function go() {
//     console.log(this.a);
//     this.a = 30;
// }
// go.prototype.a = 40;

// var test = {
//     a: 50,
//     init: function (fn) {
//         fn();
//         console.log(this.a);
//         return fn;
//     }
// }
// console.log(new go().a)

// test.init(go);
// var p = test.init(go);
// p()

// this 运行阶段 动态绑定， 谁调用this执行谁

// 讲解1 谁调用指谁
// this.a = 20;
// var test = {
//     a: 50,
//     init() {
//         console.log(this.a)
//     }
// }
// // 宿主是test 所以a 为50
// test.init()
// 讲解 默认绑定
// this.a = 20;
// var test = {
//     a: 50,
//     init() {
//         console.log(this.a)
//     }
// }
// var p = test.init;
// p()

// 隐式绑定, this 丢失 默认绑定 window 注意 严格模式, 可以使用箭头函数解决

// this.a = 20;
// var test = {
//     a: 50,
//     init() {
//         var go = () => {
//             console.log(this.a)
//         }
//         go()
//     }
// }
// test.init()

// 显示绑定 apply call bind
// new 