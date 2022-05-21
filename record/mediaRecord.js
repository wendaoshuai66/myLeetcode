function isObject(o) {
    return o && !Array.isArray(o) && Object(o) === o;
}
const ERecorderStatus = {
    IDLE: 'idle',
    ACQUIRING_MEDIA: 'acquiring_media',
    DELAYED_START: 'delayed_start',
    RECORDING: 'recording',
    PAUSED: 'paused',
    STOPPING: 'stopping',
    INACTIVE: 'inactive',
    STOPPED: 'stopped'
}
const EMediaError = {
    AbortError: 'media_aborted',
    NotAllowedError: 'permission_denied',
    NotFoundError: 'no_specified_media_found',
    NotReadableError: 'media_in_use',
    OverconstrainedError: 'invalid_media_constraints',
    TypeError: 'no_constraints',
    SecurityError: 'security_error',
    OtherError: 'other_error',
    NoRecorder: 'recorder_error',
    // 无法获取浏览器录音功能，请升级浏览器或使用Chrome
    NotChrome: 'not_chrome',
    // chrome下获取浏览器录音功能，因为安全性问题，需要在localhost或127.0.0.1或https下才能获取权限
    UrlSecurity: 'url_security',
    None: ''
}
// 每间隔2s记录一次数据
const RECORD_INTERVAL = 2 * 1000;

// 以1M为单位向外输出
const EMIT_CHUNK_UNIT_SIZE = 1 * 1024 * 1024;
const noop = () => null;
class MediaRecorder {
    constructor(params) {
        this.mediaChunks = [];
        this.mediaRecorder = null;
        this.mediaStream = null;
        this.mediaBlobUrl = '';
        this.emittedChunkSlices = 0;

        this._mediaError = EMediaError.None;
        this._recorderStatus = ERecorderStatus.IDLE;

        this.isAudioMuted = false;


        const {
            recordScreen,
            blobPropertyBag,
            mediaRecorderOptions,
            mediaStreamConstraints,
            emitChunkUnitSize = EMIT_CHUNK_UNIT_SIZE,
            recordInterval = RECORD_INTERVAL
        } = params;
        this.recordScreen = recordScreen || false;
        this.blobPropertyBag = blobPropertyBag;
        this.mediaRecorderOptions = mediaRecorderOptions;
        this.mediaStreamConstraints = mediaStreamConstraints;
        this.emitChunkUnitSize = emitChunkUnitSize;
        this.recordInterval = recordInterval;

        this.onMediaError = noop;
        this.onRecorderStart = noop;
        this.onRecorderStop = noop;
        this.onRecorderStatusChange = noop;
        this.onRecorderChunkChange = noop;
    }

    configCallbacks({
        onMediaError,
        onRecorderStart,
        onRecorderStop,
        onRecorderStatusChange,
        onRecorderChunkChange
    }) {
        this.onMediaError = onMediaError || noop;
        this.onRecorderStart = onRecorderStart || noop;
        this.onRecorderStop = onRecorderStop || noop;
        this.onRecorderStatusChange = onRecorderStatusChange || noop;
        this.onRecorderChunkChange = onRecorderChunkChange || noop;
    }

    createAudioContext(sampleRate = 16000) {
        // 设定采样率为16k
        this.audioContext = new Audio({
            sampleRate
        })
        return this.audioContext;
    }
    checkConstraints(mediaType) {
        let supportedMediaConstraints = null;

        // mediaDevices 是 Navigator 只读属性，返回一个 MediaDevices 对象，该对象可提供对相机和麦克风等媒体输入设备的连接访问，也包括屏幕共享。
        if (navigator.mediaDevices) {
            supportedMediaConstraints = navigator.mediaDevices.getSupportedConstraints();
        }

        console.log(supportedMediaConstraints, '----supportedMediaConstraints--')

        if (supportedMediaConstraints === null) {
            return;
        }
        let unSupportedMediaConstraints = Object.keys(mediaType).filter(
            (constraint) => !supportedMediaConstraints[constraint]
        );

        if (unSupportedMediaConstraints.length !== 0) {
            let toText = unSupportedMediaConstraints.join(',');
            console.error(`The following constraints ${toText} are not supported on this browser.`);
        }
    }

    // 检查video/audio传入的参数和请求编解码类型是否正确
    checkMediaConstraints() {


        // MediaRecorder 是 MediaStream Recording API 提供的用来进行媒体轻松录制的接口, 他需要通过调用 MediaRecorder() 构造方法进行实例化.
        if (!window.MediaRecorder) {
            throw new Error('Unsupported Browser');
        }

        if (isObject(this.mediaStreamConstraints.audio) && typeof this.mediaStreamConstraints.audio !== 'boolean') {
            this.checkConstraints(this.mediaStreamConstraints.audio);
        }
        if (isObject(this.mediaStreamConstraints.video) && typeof this.mediaStreamConstraints.video !== 'boolean') {
            this.checkConstraints(this.mediaStreamConstraints.video);
        }
    }

    checkMediaRecorderOptions() {
        if (this.mediaRecorderOptions && this.mediaRecorderOptions.mimeType) {
            /*
             * MediaRecorder.isTypeSupported is a function announced in https://developers.google.com/web/updates/2016/01/mediarecorder
             * and later introduced in the MediaRecorder API spec http://www.w3.org/TR/mediastream-recording/
             * 1. 'video/webm;codecs=vp9'
             * 2. 'video/webm;codecs=h264'
             * 3. 'video/webm'
             * 4. 'video/mp4' Safari 14.0.2 has an EXPERIMENTAL version of MediaRecorder enabled by default
             */
            if (
                typeof MediaRecorder.isTypeSupported === 'function' &&
                !MediaRecorder.isTypeSupported(this.mediaRecorderOptions.mimeType)
            ) {
                console.error(`The specified MIME type you supplied for MediaRecorder doesn't support this browser`);
            }
        }
    }
    async requestUserMedia() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            this.recorderStatus = ERecorderStatus.ACQUIRING_MEDIA;

            try {
                let stream;

                if (this.recordScreen) {
                    //getDisplayMedia() 最常用于捕获用户屏幕（ 或其部分） 的视频。 但是， 用户代理可能允许捕获音频以及视频内容。 此音频的来源可能是选定的窗口、 整个计算机的音频系统或用户的麦克风（ 或以上所有内容的组合）
                    // https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture
                    stream = await window.navigator.mediaDevices.getDisplayMedia(this.mediaStreamConstraints);
                } else {
                    // 该 方法提示用户允许使用媒体输入，该输入产生 包含所请求媒体类型的轨道。
                    // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
                    stream = await window.navigator.mediaDevices.getUserMedia(this.mediaStreamConstraints);
                }

                if (this.recordScreen && this.mediaStreamConstraints.audio) {
                    let audioStream = await window.navigator.mediaDevices.getUserMedia({
                        audio: this.mediaStreamConstraints.audio
                    });

                    audioStream.getAudioTracks().forEach((audioTrack) => stream.addTrack(audioTrack));
                }

                this.mediaStream = stream;
                this.recorderStatus = ERecorderStatus.IDLE;
            } catch (err) {
                // 详细信息见当前目录的`README.md`文档
                console.error(err);
                const errName = err.name;
                if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
                    // required track is missing
                    // 找不到满足请求参数的媒体类型。
                    this.mediaError = EMediaError.NotFoundError;
                } else if (errName === 'NotReadableError' || errName === 'TrackStartError') {
                    // 媒体设备已经被其他的应用所占用了
                    // 操作系统上某个硬件、浏览器或者网页层面发生的错误导致设备无法被访问。
                    // webcam or mic already in use
                    this.mediaError = EMediaError.NotReadableError;
                } else if (errName === 'OverConstrainedError' || errName === 'ConstraintNotSatisfiedError') {
                    // 当前设备不满足constraints条件
                    this.mediaError = EMediaError.OverconstrainedError;
                } else if (errName === 'NotAllowedError' || errName === 'permissionDeniedError') {
                    // permission denied in browser
                    // 用户拒绝了当前的浏览器实例的访问请求；或者用户拒绝了当前会话的访问；或者用户在全局范围内拒绝了所有媒体访问请求。
                    this.mediaError = EMediaError.NotAllowedError;
                } else if (errName === 'TypeError') {
                    // 类型错误，constraints对象未设置［空］，或者都被设置为false。
                    this.mediaError = EMediaError.TypeError;
                } else if (errName === 'AbortError') {
                    // 硬件问题
                    this.mediaError = EMediaError.AbortError;
                } else if (errName === 'SecurityError') {
                    // 安全错误，在getUserMedia() 被调用的 Document 上面，使用设备媒体被禁止。这个机制是否开启或者关闭取决于单个用户的偏好设置。
                    this.mediaError = EMediaError.SecurityError;
                } else {
                    // other errors
                    this.mediaError = EMediaError.OtherError;
                }

                this.recorderStatus = ERecorderStatus.IDLE;
            }
        } else {
            if (navigator.userAgent.toLowerCase().match(/chrome/) && location.origin.indexOf('https://') < 0) {
                this.mediaError = EMediaError.UrlSecurity;
            } else {
                this.mediaError = EMediaError.NotChrome;
            }
        }
    }

    startRecord() {
        this.mediaError = EMediaError.None;
        if (!this.mediaStream) {
            return;
        }

        // 如果已经有了recorder，先暂停再开始
        if (this.mediaRecorder) {
            if (this.recorderStatus === ERecorderStatus.DELAYED_START) {
                return;
            }
            this.recorderStatus = ERecorderStatus.DELAYED_START;
            this.mediaRecorder.onstart(this.recordInterval);

            return;
        }

        if (this.mediaRecorderOptions) {
            this.mediaRecorder = new MediaRecorder(this.mediaStream, this.mediaRecorderOptions);
        } else {
            this.mediaRecorder = new MediaRecorder(this.mediaStream);
        }

        this.mediaRecorder.ondataavailable = this.onRecordingDataAvailable;
        this.mediaRecorder.onstop = this.onRecordingStop;
        this.mediaRecorder.onerror = this.onRecordingError;
        this.mediaRecorder.onstart = this.onRecordingStart;

        if (this.recorderStatus === ERecorderStatus.DELAYED_START) {
            return;
        }
        this.recorderStatus = ERecorderStatus.DELAYED_START;
        this.mediaRecorder.onstart(this.recordInterval);
    }

    onRecordingDataAvailable = (evt) => {
        const {
            data
        } = evt;
        this.mediaChunks.push(data);

        // 融合全部的chunks为整体
        let tmpAllBlobs = new Blob(this.mediaChunks, {
            type: data.type
        });

        // 可以向外传出的chunks个数
        const availableChunkSlices = Math.floor(tmpAllBlobs.size / this.emitChunkUnitSize);

        // 应该向外传出的chunks个数
        const shouldEmittedChunkSlices = availableChunkSlices - this.emittedChunkSlices;

        // 传出应该传出的chunks
        for (let i = 0; i < shouldEmittedChunkSlices; i++) {
            const startChunkIndex = this.emittedChunkSlices + i;
            const startIndex = startChunkIndex * this.emitChunkUnitSize;
            const endIndex = (startChunkIndex + 1) * this.emitChunkUnitSize;
            const emitChunk = tmpAllBlobs.slice(startIndex, endIndex, data.type);

            this.onRecorderChunkChange(startChunkIndex + 1, emitChunk, this.mediaChunks);
        }
        // 更新已传出chunks数量
        this.emittedChunkSlices += shouldEmittedChunkSlices;

        // 当结束记录时，可能有一小部分大小达不到this.emitChunkUnitSize的值，这里进行单独的传出
        if (this.recorderStatus === ERecorderStatus.STOPPED || this.recorderStatus === ERecorderStatus.STOPPING) {
            const startIndex = this.emittedChunkSlices * this.emitChunkUnitSize;
            const endIndex = tmpAllBlobs.size;
            const emitChunks = tmpAllBlobs.slice(startIndex, endIndex, data.type);

            this.onRecorderChunkChange(this.emittedChunkSlices + 1, emitChunks, this.mediaChunks);
        }
        tmpAllBlobs = null;
    };

    onRecordingStop = () => {
        const {
            url,
            blob
        } = this.createBlobUrl();
        this.recorderStatus = ERecorderStatus.STOPPED;
        this.mediaBlobUrl = url;
        this.onRecorderStop(url, blob);

        this.emittedChunkSlices = 0;
        this.mediaChunks = [];
    };

    onRecordingStart = (evt) => {
        this.clearBlobUrl();
        this.recorderStatus = ERecorderStatus.RECORDING;
        this.onRecorderStart();
    };

    onRecordingError = (event) => {
        console.error(event);
        this.mediaError = EMediaError.NoRecorder;
        this.recorderStatus = ERecorderStatus.IDLE;
    };

    pauseRecord() {
        if (this.mediaRecorder && this.mediaRecorder.state === ERecorderStatus.RECORDING) {
            this.mediaRecorder.pause();
            this.recorderStatus = ERecorderStatus.PAUSED;
        }
    }

    resumeRecord() {
        if (this.mediaRecorder && this.mediaRecorder.state === ERecorderStatus.PAUSED) {
            this.mediaRecorder.resume();
            this.recorderStatus = ERecorderStatus.RECORDING;
        }
    }
    stopRecord() {
        if (
            this.mediaRecorder &&
            this.mediaRecorder.state !== ERecorderStatus.INACTIVE &&
            this.recorderStatus === ERecorderStatus.RECORDING
        ) {
            this.mediaRecorder.onStop();
            this.recorderStatus = ERecorderStatus.STOPPING;

            this.mediaStream && this.mediaStream.getTracks().forEach((track) => track.stop());
        }
    }

    muteAudio(mute) {
        this.isAudioMuted = mute;
        if (this.mediaStream) {
            this.mediaStream.getAudioTracks().forEach((audioTrack) => (audioTrack.enabled = !mute));
        }
    }

    createBlobUrl() {
        const [firstChunk] = this.mediaChunks;

        const other =
            this.blobPropertyBag || (this.mediaStreamConstraints.video ? {
                type: 'video/mp4'
            } : {
                type: 'audio/wav'
            });

        // const blobProperty: BlobPropertyBag = Object.assign(
        //   { type: chunk.type },
        //   blobPropertyBag || (video ? { type: 'video/mp4' } : { type: 'audio/wav' })
        // )

        const blobProperty = {
            type: firstChunk.type,
            ...other
        };

        const blob = new Blob(this.mediaChunks, blobProperty);
        const url = URL.createObjectURL(blob);

        return {
            url,
            blob
        };
    }

    clearBlobUrl() {
        URL.revokeObjectURL(this.mediaBlobUrl);
        this.mediaBlobUrl = '';
    }
    getMediaStream() {
        if (this.mediaStream) {
            return this.mediaStream;
        }
        return null;
    }
}