// alert(a)
// a()
// var a = 3;

// function a() {
//     alert(10)
// }
// alert(a)
// a = 6;
// a();
// 分析 函数提升优先 变量提升
// function var a; a = 3;
// 答案是 funciton a() 10  3 报错 a is not function

// 函数优先级 大于 变量赋值优先级
// function a() {}
// var a = 4;
// console.log(a)

// if (false) {
//     var a = 20;
// }
// console.log(a) // 是 undefined 不是 is not defined

// function b() {
//     var a = 20;
// }
// console.log(a) //  a is not defined a 提升到函数顶端

// {
//     // Cannot access 'a' before initialization
//     console.log(a)
//     let a = 2;
// }

var x = 1,
    y = 0,
    z = 0;

y = add(x);
console.log(y)

function add(x) {
    return (x = x + 3)
}
z = add(x);
console.log(z)
// 形参的障眼法 需要注意
// 4 4