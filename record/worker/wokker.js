// eslint-disable-next-line no-undef
importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs/dist/tf.min.js');
var model;

//load tf model
(async () => {
    const baseUrl = self.location.href.replace(/\/[^\/]*$/, '')
    const modelUrl = `${baseUrl}/model.json`;
    try {
        model = await tf.loadGraphModel(modelUrl);
        postMessage({
            message: 'load_success'
        })
    } catch (e) {
        postMessage({
            message: 'load_model_failed'
        })
    }
})()

const width = 640
const scale = 0.5;

function transform(prediction) {
    let hands = []
    let faces = []

    prediction.forEach((object) => {
        let rates = object.splice(-4)
        let smileRate = rates[0]
        let bgRate = rates[1]
        let faceRate = rates[2]
        let handRate = rates[3]

        let pos = object.map((val) => {
            return val * width * scale
        })

        let type = [bgRate, faceRate, handRate].indexOf(Math.max(bgRate, faceRate, handRate))
        if (type === 1) {
            let facePos = pos.slice(0, 4)
            let eyesPos = pos.slice(4, 24)
            let mouthPos = pos.slice(24, 52)
            faces.push({
                faceRate,
                smileRate,
                facePos,
                mouthPos,
                eyesPos,
            })
        }
        if (type === 2) {
            hands.push({
                handRate,
                handPos: pos.slice(0, 4),
            })
        }
    })
    return {
        faces,
        hands,
    }
}

async function predict(imageData, imageId) {
    let data = []
    imageData.data.forEach((val, index) => {
        if (index % 4 !== 3) {
            data.push(val)
            //data.push(val / 255);
        }
    })

    // let pixels = tf.browser.fromPixels(data).reshape([1, 320, 320, 3]);  // for example
    // pixels = tf.cast(pixels, 'float32')

    let inputData = tf.tidy(() => {
        return tf.tensor(data).reshape([1, imageData.width, imageData.height, 3])
    })

    try {
        const t0 = performance.now()
        let prediction = await model.executeAsync(inputData)

        inputData.dispose()
        tf.dispose(inputData)
        inputData = null

        let output = tf.tidy(() => {
            return transform(prediction.arraySync())
        })

        const t1 = performance.now()
        postMessage({
            message: 'predict_success',
            output,
            frame: 1000 / (t1 - t0),
            id: imageId
        })

        prediction.dispose && prediction.dispose()
        tf.dispose(prediction)
        prediction = null
        output = null
    } catch (error) {
        inputData && inputData.dispose()
        tf.dispose(inputData)
        inputData = null
        postMessage({
            message: 'predict_failed',
            error
        })
    }
}

onmessage = function (img) {
    // console.log(img, '----')
    // create ImageData object that can use in tfjs
    const image = new ImageData(new Uint8ClampedArray(img.data.buffer), img.data.width, img.data.height)

    if (!model) {
        postMessage({
            message: 'model_not_loaded'
        })
        return
    }

    predict(image, img.data.id)
}