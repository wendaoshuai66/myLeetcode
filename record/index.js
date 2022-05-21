const options = {

    video: {
        width: 862,
        height: 485,
        deviceId: 'default',
    },
    audio: {
        deviceId: 'default',
    },
    preview: {
        width: 640,
        height: 360
    },
    previewImageSize: 3,
    onRequestTXASRSignature: () => Promise.resolve('wss://asr.cloud.tencent.com/asr/v2/1303248253?convert_num_mode=1&engine_model_type=16k_zh&expired=1632494891&filter_dirty=1&filter_modal=2&filter_punc=0&hotword_id=08003a00000000000000000000000000&needvad=1&nonce=16324913&secretid=AKIDdCU1KGl1nKXquwnI8j7H4dw0pulN2KRg&t=1632491291297&timestamp=1632491291&vad_silence_time=800&voice_format=1&voice_id=02c9900b-6c58-4e38-a58f-2d16d9102a61&word_info=2&signature=7tGxxgbRLUMYLtL51x%2FxbXzhHoo%3D'),
    // onRequestGoogleASRToken: () => Promise.resolve('wss://ws.umu.co:8096/stt?token=abcdefghigklmnopqrstuvwxyz&lang=JP'),
    onRequestGoogleASRToken: () => Promise.resolve('ws://172.24.11.178:8080/stt?token=abcdefghigklmnopqrstuvwxyz&lang=TW'),
    onRecordWorkerPreflightSucceed: () => {
        console.log('------------_> onRecordWorkerPreflightSucceed')
    },
    onRecordStart: (start) => {
        console.log('------------_> onRecordStart', start)
    },
    onRecordStop: (result) => {
        console.log('------------_> onRecordStop', result)
    },
    onRecorderChunkDataChange: (chunkIndex, chunkData) => {
        // console.log('------------_> onRecorderChunkDataChange', chunkIndex, chunkData)
    },
    onCountdownStart: () => {
        console.log('----> onCountdownStart')
    },
    aiScoreSetting: {
        smileThreshold: 0.4,
        volumeThreshold: 0.2,
        smilePassLine: 0.6,
    },
}
const vedioEle = document.getElementById('video');
const videoCanvasEle = document.getElementById('video-canvas');
const videoElWidth = vedioEle.getBoundingClientRect().width
const videoElHeight = vedioEle.getBoundingClientRect().height
const videoCanvasElWidth = videoCanvasEle.width
const videoCanvasElHeight = videoCanvasEle.height
const videoCtx = videoCanvasEle.getContext('2d')

let fakeCanvas = document.createElement('canvas')
fakeCanvas.width = PREDICT_SIZE
fakeCanvas.height = PREDICT_SIZE
const fakeCanvasCtx = fakeCanvas.getContext('2d', {
    alpha: false
})

const previewCanvas = document.createElement('canvas')
previewCanvas.width = options.preview.width
previewCanvas.height = options.preview.height
const previewCanvasCtx = previewCanvas.getContext('2d', {
    alpha: false
})

let mediaRecorder;
let mediaStream;

function onMediaError() {

}

function onRecorderStatusChange() {

}

function onRecorderChunkDataChange() {

}

function onMediaError() {

}

function onRecorderStatusChange(emittedChunkSlices, emitChunks, mediaChunks) {
    console.log(emittedChunkSlices, '---a--')
    console.log(emitChunks, '--b--')
    console.log(mediaChunks, '--cc--')
}

function onRecorderChunkDataChange() {

}

function onRecorderStop() {

}

function onRecorderStart() {
    // startPredict(vedioEle)
}
const worker = new Worker('./worker/wokker.js')
async function setupMediaRecorder() {
    if (!options.video || !options.audio) {
        throw Error('video or audio must be specified')
    }
    mediaRecorder = new MediaRecorder({
        emitChunkUnitSize: options.emitChunkUnitSize,
        mediaStreamConstraints: {
            audio: {
                deviceId: options.audio.deviceId
            },
            video: {
                width: {
                    ideal: options.video.width
                },
                height: {
                    ideal: options.video.height
                },
                deviceId: options.video.deviceId,
            },
        },
    })


    mediaRecorder.configCallbacks({
        onMediaError: onMediaError,
        onRecorderStatusChange: onRecorderStatusChange,
        onRecorderChunkChange: onRecorderChunkDataChange,
        onRecorderStop: onRecorderStop,
        onRecorderStart: onRecorderStart,
    })

    await mediaRecorder.requestUserMedia()
    mediaStream = mediaRecorder.getMediaStream()
    return mediaStream;

}
setupMediaRecorder().then((stream) => {
    vedioEle.srcObject = stream;
    vedioEle.play()
})

function startPredict(vedioEle) {
    const videoWidth = options.video.width;
    const videoHeight = options.video.height;
    let predictData = getPredictImageDataFromVideoElement({
        ctx: fakeCanvasCtx,
        videoElement: vedioEle,
        videoWidth,
        videoHeight,
        predictSize: PREDICT_SIZE,
    })

    const previewData = getPreviewImageDataFromVideoElement({
        id: predictData.id,
        videoElement: vedioEle,
        videoWidth,
        videoHeight,
        width: options.preview.width,
        height: options.preview.height,
        previewCanvas: previewCanvas,
        previewCanvasCtx: previewCanvasCtx,
    })

    // console.log(predictData, '-predictData--')
    // console.log(previewData, '--previewData--')
    worker.postMessage(predictData);
}

const recordBtn = document.getElementById('record-btn');

recordBtn.onclick = function () {
    mediaRecorder.startRecord();
}

worker.onmessage = debounce((evt) => {
    const data = evt.data;
    if (data.output) {
        drawFaceCanvas(videoCtx, data.output, videoCanvasElWidth, videoCanvasElHeight)
    }
    if (data.message && data.message === 'load_success') {
        console.log('success')
        request()
    }
    // startPredict(vedioEle)
    // console.log(data, '---data--')
}, 80);

function request() {
    requestAnimationFrame(function F(t) {
        //会不断打印执行回调的时间，如果刷新频率为60Hz，则相邻的t间隔时间大约为1000/60 = 16.7ms
        // console.log(Math.random());
        console.log(t, "====");
        // console.log(vedioEle, '=vedioEle==')
        // startPredict(vedioEle)
        // requestAnimationFrame(F);
    });
}