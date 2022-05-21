let graphs = {};
/** @type {HTMLCanvasElement} */
const canvas = document.getElementById('canvas');
const hiddenCanvas = document.getElementById('hideCanvas');

const ctx = canvas.getContext('2d');
const hideCtx = hiddenCanvas.getContext('2d');

hideCtx.width = ctx.width = canvas.width = hideCanvas.width = document.body.offsetWidth;
hideCtx.height = ctx.height = canvas.height = hideCanvas.height = document.body.offsetHeight;

// 声明三角形

let trianglePoint = [{
    x: 75,
    y: 50
}, {
    x: 100,
    y: 75
}, {
    x: 100,
    y: 25
}];

let downFlag = false;
let selectedGraph = null; // 当前选中图形的元素颜色

initDraw(ctx, hideCtx, trianglePoint, false, 5, '#000000'); // 初始化绘图

// //随机生成16位的颜色值
function getRandomColor() {
    return '#' + (function (color) {
        return (color += '0123456789abcdef' [Math.floor(Math.random() * 16)]) &&
            (color.length == 6) ? color : arguments.callee(color);
    })('');
}

// function initDraw(ctx, hideCtx, points, isFill, lineWidth, color) {
//     // 初始化图形及底色
//     let roundColor = getRandomColor();
//     graphs[roundColor] ? roundColor = getRandomColor : ''
//     graphs[roundColor] = {
//         points,
//         color,
//         isFill,
//         lineWidth
//     }
//     drawGraphs(ctx, hideCtx, points, isFill, lineWidth, color)
// }

// function drawGraphs(ctx, hideCtx, points, isFill, lineWidth, lowColor, color) {
//     drawSingleGraph(ctx, points, isFill, lineWidth, color); //绘制可视化的画布
//     drawSingleGraph(hideCtx, points, isFill, lineWidth, lowColor);
// }

function initDraw(ctx, hideCtx, points, isFill, lineWidth, color) {
    // 初始化图形及底色
    let roundColor = getRandomColor()
    graphs[roundColor] ? roundColor = getRandomColor : ''
    graphs[roundColor] = {
        points,
        color,
        isFill,
        lineWidth
    }
    drawGraphs(ctx, hideCtx, points, isFill, lineWidth, roundColor, color)
}

function drawGraphs(ctx, hideCtx, points, isFill, lineWidth, lowColor, color) {
    drawSingleGraph(ctx, points, isFill, lineWidth, color); //绘制可视化的画布
    drawSingleGraph(hideCtx, points, isFill, lineWidth + 10, lowColor);
}

function drawSingleGraph(ctx, points, isFill, lineWidth, color) {
    ctx.clearRect(0, 0, ctx.width, ctx.height);
    ctx.save();
    ctx.beginPath();
    color && (isFill ? ctx.fillStyle = color : ctx.strokeStyle = color);
    ctx.lineWidth = lineWidth;
    points.forEach((point, index) => {
        if (!index) {
            ctx.moveTo(point.x, point.y);
        } else {
            ctx.lineTo(point.x, point.y);
        }
    })
    ctx.closePath();
    isFill ? ctx.fill() : ctx.stroke();
    ctx.restore();
}

canvas.addEventListener('mousedown', function (e) {
    let pointX = e.clientX;
    let pointY = e.clientY;

    let getHideColor = hideCtx.getImageData(pointX, pointY, 1, 1).data;
    const getHexColor = rgbToHex(getHideColor[0], getHideColor[1], getHideColor[2]);
    const graphsData = graphs[getHexColor]; // 选中图像的信息

    console.log('getHexColor', getHexColor);
    console.log('getHideColor', getHideColor);
    console.log('graphsData', graphsData)
    selectedGraph = getHexColor;
    downFlag = {
        lastPointX: pointX,
        lastPointY: pointY,
    }

    if (!graphsData) {
        return;
    }

    const {
        points,
        isFill,
        lineWidth
    } = graphsData
    graphsData.color = '#ff0000'
    drawGraphs(ctx, hideCtx, points, isFill, lineWidth, selectedGraph, graphsData.color)
}, false)

canvas.addEventListener('mousemove', function (e) {
    const graphsData = graphs[selectedGraph]; //选中的图形信息
    if (!downFlag || !graphsData) { //判断是否鼠标点击或者选中图形
        return;
    }

    let pointX = e.clientX,
        pointY = e.clientY; //鼠标当前的位置
    let {
        lastPointX,
        lastPointY
    } = downFlag; //上一次鼠标的位置
    let distanceX = pointX - lastPointX,
        distanceY = pointY - lastPointY; //两次位置的差距

    let {
        points,
        isFill,
        lineWidth,
        color
    } = graphsData
    let newPoints = points.map(val => {
        return {
            x: val.x + distanceX,
            y: val.y + distanceY
        }
    })
    downFlag = {
        lastPointX: pointX,
        lastPointY: pointY
    }
    graphsData.points = newPoints
    drawGraphs(ctx, hideCtx, newPoints, isFill, lineWidth, selectedGraph, color);
})

canvas.addEventListener('mouseup', function (e) {
    if (!downFlag) {
        return
    }
    downFlag = false
    const graphsData = graphs[selectedGraph]; //选中的图形信息
    if (!graphsData) { //没有选中图形
        return
    }
    const {
        points,
        isFill,
        lineWidth
    } = graphsData;
    graphsData.color = '#000000'
    drawGraphs(ctx, hideCtx, points, isFill, lineWidth, selectedGraph, graphsData.color); //选中更新边框颜色
    selectedGraph = null
}, false)


function rgbToHex(...args) {
    return "#" + args.map((ele) => {
        const hex = ele.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}