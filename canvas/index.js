/** @type {HTMLCanvasElement} */

const canvas = document.getElementById('canvas')
let context = canvas.getContext('2d');

context.beginPath(); // 开始路劲， 重置一个结合

context.moveTo(75, 50);

context.lineTo(100, 75);


context.lineTo(100, 25);

// context.fillStyle = 'green';

context.closePath(); // 路劲闭合，数据集合存储

context.stroke(); // 从集合中拿到点
console.log(context.getImageData(0, 0, 100, 1).data)
/**
 * 笔试绘图仪 控制路径（点） 生成 绘制
 * 绘图的状态
 * context.save()
 * context.restore() 堆栈的过程
 * canvas 绘图真正就是像素点 canvas =》像素点 =》 图片
 * 图形拾取 有一个维护图形的状态
 * 1. 拾取
 * 2. 事件封装
 * 3. 局部渲染（chrome 局部绘制）
 * 4. 图形层级控制 （控制绘图顺序）
 * https: //developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API
 * https: //github.com/myliang/xspreadsheet
 * 
 * 1. 多线程计算webWoker postMessage = 》结构化克隆算法 SharedArrayBuffer
 * 2. 结合 webAssemly ffmpeg
 */