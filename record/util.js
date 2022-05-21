const VIDEO_WIDTH = 862
const VIDEO_HEIGHT = 485
const PREDICT_SIZE = 320
const SCALE_RATIO = VIDEO_WIDTH / PREDICT_SIZE
const CANVAS_PALETTE = {
    face: {
        color: '#FFD92B',
        pointColor: '#FF9800',
        opacity: ['100%', '20%'],
    },
    eye: {
        color: '#46D06E',
        pointColor: '#1F9E40',
        opacity: ['100%', '20%'],
    },
    mouth: {
        color: '#FFA43E',
        pointColor: '#E56014',
        opacity: ['100%', '20%'],
    },
    hand: {
        color: '#5ec8fe',
        pointColor: '#0b66f9',
        opacity: ['100%', '20%'],
    },
    sound: {
        color: '#F5A623',
        pointColor: '',
        opacity: ['100%', '8%', '%0'],
    },
}

function drawFaceCanvas(
    videoCtx,
    output,
    videoCtxWidth,
    videoCtxHeight
) {
    const {
        hands,
        faces
    } = output
    videoCtx.clearRect(0, 0, videoCtxWidth, videoCtxHeight)

    faces.forEach((face) => {
        const faceRate = face.faceRate
        const facePos = face.facePos

        // draw face border
        if (faceRate > 0.3) {
            const [x1, y1, x2, y2] = facePos
            drawFaceBorder(videoCtx, x1, y1, x2, y2, 3, 'face')
        }

        const offset = 0

        // draw eyes border
        const eyesPos = face.eyesPos

        const ex1 = eyesPos[4] - offset
        const ey1 = eyesPos[1] - offset
        const ex4 = eyesPos[16] + offset
        const ey4 = eyesPos[13] + offset
        drawFaceBorder(videoCtx, ex1, ey1, ex4, ey4, 3, 'eye')

        const mouthPos = face.mouthPos
        const mx1 = mouthPos[0]
        const my1 = mouthPos[7]
        const mx2 = mouthPos[12]
        const my2 = mouthPos[19]
        drawFaceBorder(videoCtx, mx1, my1, mx2, my2, 3, 'mouth')
    })

    hands.forEach((hand) => {
        const [x1, y1, x2, y2] = hand.handPos
        drawFaceBorder(videoCtx, x1, y1, x2, y2, 3, 'hand')
    })
}

function drawFaceBorder(
    videoCtx,
    xPos,
    yPos,
    x2Pos,
    y2Pos,
    lineWidth = 3,
    type = 'face'
) {
    const {
        color: lineColor,
        pointColor
    } = CANVAS_PALETTE[type]

    xPos = xPos * SCALE_RATIO
    yPos = yPos * SCALE_RATIO

    x2Pos = x2Pos * SCALE_RATIO
    y2Pos = y2Pos * SCALE_RATIO

    drawRectBorder(videoCtx, xPos, yPos, x2Pos, y2Pos, lineWidth, lineColor, pointColor)
}

function drawRectBorder(
    videoCtx,
    xPos,
    yPos,
    x2Pos,
    y2Pos,
    lineWidth,
    lineColor,
    pointColor
) {
    videoCtx.lineWidth = lineWidth //设置线条宽度

    drawLine(videoCtx, xPos, yPos, xPos, y2Pos, lineColor, pointColor)
    drawLine(videoCtx, xPos, y2Pos, x2Pos, y2Pos, lineColor, pointColor)
    drawLine(videoCtx, x2Pos, y2Pos, x2Pos, yPos, lineColor, pointColor)
    drawLine(videoCtx, x2Pos, yPos, xPos, yPos, lineColor, pointColor)

    videoCtx.closePath()
}

function drawLine(
    videoCtx,
    xStartPos,
    yStartPos,
    xEndPos,
    yEndPos,
    lineColor,
    pointColor
) {
    drawStartPoint(videoCtx, xStartPos, yStartPos, pointColor, 2)
    drawGradientLine(videoCtx, xStartPos, yStartPos, xEndPos, yEndPos, lineColor)
}

function drawGradientLine(
    videoCtx,
    xStartPos,
    yStartPos,
    xEndPos,
    yEndPos,
    lineColor
) {
    const gradient = videoCtx.createLinearGradient(xStartPos, yStartPos, xEndPos, yEndPos)

    gradient.addColorStop(0, lineColor)
    gradient.addColorStop(0.8, lineColor + '88')
    gradient.addColorStop(1, lineColor + '00')

    videoCtx.beginPath()
    videoCtx.moveTo(xStartPos, yStartPos)
    videoCtx.lineTo(xEndPos, yEndPos)
    videoCtx.strokeStyle = gradient
    videoCtx.stroke()
}

function drawStartPoint(videoCtx, x, y, color, radius) {
    videoCtx.fillStyle = color

    videoCtx.beginPath()
    videoCtx.arc(x, y, radius, 0, 2 * Math.PI)
    videoCtx.fill()
    videoCtx.closePath()
}

function getPredictImageDataFromVideoElement({
    ctx,
    videoElement,
    videoWidth,
    videoHeight,
    predictSize,
}) {
    ctx.clearRect(0, 0, predictSize, predictSize)
    ctx.save()
    ctx.translate(predictSize, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(
        videoElement,
        0,
        0,
        videoWidth,
        videoHeight,
        0,
        0,
        predictSize,
        (predictSize * videoHeight) / videoWidth
    )
    ctx.restore()

    const imageData = ctx.getImageData(0, 0, predictSize, predictSize)
    const imageDataBuffer = imageData.data.buffer
    const imageWidth = imageData.width
    const imageHeight = imageData.height

    return {
        id: makeId(4),
        buffer: imageDataBuffer,
        width: imageWidth,
        height: imageHeight,
    }
}

function getPreviewImageDataFromVideoElement({
    id,
    videoElement,
    videoWidth,
    videoHeight,
    width = 640,
    height = 360,
    // previewCanvas,
    previewCanvasCtx,
}) {
    previewCanvasCtx.clearRect(0, 0, width, height)
    previewCanvasCtx.save()
    previewCanvasCtx.translate(width, 0)
    previewCanvasCtx.scale(-1, 1)
    previewCanvasCtx.drawImage(videoElement, 0, 0, videoWidth, videoHeight, 0, 0, width, height)
    previewCanvasCtx.restore()

    const previewImageData = previewCanvasCtx.getImageData(0, 0, width, height)

    return {
        id,
        previewImageData,
    }
}

function makeId(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    let result = ''
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }

    return result
}


const debounce = (func, wait, context, immediate = false) => {
    context = context || null;
    let timeout;
    return (...args) => {
        let later = () => {
            timeout = null;
            if (!immediate) {
                func.call(context, ...args);
            }
        }
        const callNow = immediate && !timeout;
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = window.setTimeout(later, wait);
        if (callNow) {
            func.call(context, ...args);
        }
    }
}