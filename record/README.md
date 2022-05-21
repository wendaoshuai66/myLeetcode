前端多媒体权限管理和录制库

### Prop Types

| Property               | Type                   | Default | Description | required |
| ---------------------- | ---------------------- | ------- | ----------- | -------- |
| mediaStreamConstraints | MediaStreamConstraints |         |             | N        |
| recordScreen           | boolean                |         |             | N        |
| blobPropertyBag        | object                 |         |             | N        |
| mediaRecorderOptions   | object                 |         |             | N        |
| recordInterval         | number                 |         |             | N        |
| emitChunkUnitSize      | number                 |         |             | N        |
| onRecorderStart        | function               |         |             | N        |
| onRecorderStop         | function               |         |             | N        |
| onRecorderStatusChange | function               |         |             | N        |
| onRecorderChunkChange  | function               |         |             | N        |
| onMediaError           | function               |         |             | N        |

## 用户申请摄像头、麦克风权限时的问题

1. 用户没有摄像头，只有一个麦克风
2. 用户（不小心地）拒绝了浏览器的使用摄像头请求
3. 用户在你的 getUserMedia()代码已经初始化之后才将摄像头/麦克风插到电脑上
4. 媒体设备已经被其他的应用所占用了
5. 只针对 Firefox：设备已经被 Firefox 浏览器的其他标签页所占用了

### NotFoundError

这个问题真的是非常常见，当你通过约束请求一个视频轨道但是用户没有摄像头的时候，这个错误就会出现。还有，当你请求一个音频/麦克风轨道的时候，但是电脑/设备并没有声卡或者录音设备被系统禁用的时候也会出现这个错误。但是这种情况比较罕见。

1. Firefox 会弹出一个 MediaStreamError，其名称属性为`NotFoundError`并显示消息“无法找到该对象”。
2. Chrome 会出现一个 NavigatorUserMediaError，其名称属性为`DevicesNotFoundError`。

### NotReadableError

这种情况会在 Windows 系统上发生，当浏览器想要使用网络摄像头或者麦克风的时候却发现他们已经被使用了（比如说 Skype 正在用）。在 Windows 上这个错误很常见，因为进程可以独占摄像头的访问权。除了 Firefox，它不会在 macOS 上出现因为 mac 系统允许几个进程共享摄像头/麦克风的使用权限。

1. 在 Windows 系统上，Firefox 会在其他应用或者 Firefox 标签页正在使用摄像头或者麦克风的时候弹出这个错误。这个错误类型是 MediaStreamError，名称属性被设置为“NotReadableError”，消息属性被设置为“未能分配视频源”。
   Windows 系统上的 Chrome 浏览器会弹出一个 NavigatorUserMediaError，其名称属性被设为“TrackStartError”，非规范的 Chrome 特定版本，没有消息提示。不同的 Chrome 标签页可以共享同一个摄像头。
2. 在 mac 系统上，这个错误只有在 Firefox 不止一个标签页尝试获取摄像头和麦克风的时候出现。会提示一个消息“当前麦克风进程受限”。

### OverconstrainedError

当你请求一个无法用硬件满足的约束时会出现在这个错误，举个例子，当使用 min 或者 exact 关键词请求一个比较高的帧速率或者高的分辨率的时候就会出现此错误。

1. Firefox 会提出一个 MediaStreamError，其名称属性被设为`OverconstrainedError`。
2. Chrome 会弹出一个 NavigatorUserMediaError，其名称属性设为`ConstraintNotSatisfiedError`，一个非规范的 Chrome 特定版本。
3. Chrome 和 Firefox 会返回请求的分辨率，或者当使用了 ideal 值的时候返回一个最接近的分辨率，但是如果你开始使用的是 min 关键字并赋予了比较大的值，或者 exact 关键字含有不支持的值，你就会立即触发这个错误。

错误项还会通过 constraintName 属性提醒你约束无法满足，并且会弹出消息“约束无法满足”

### NotAllowedError

当用户拒绝（或者之前拒绝过）摄像头或者麦克风的使用请求时就会出现这个错误。

1. Firefox 会出现 MediaStreamError，名称属性设置为`NotAllowedError`，以及弹出消息“用户代理或者当前平台不允许该请求”。
2. Chrome 会出现 NavigatorUserMediaError，其名称属性设为`PermissionDeniedError`。

### TypeError

当传递给 getUserMedia()的约束对象为空或者将所有轨道（音轨，视频轨，或者两者）被设置为 false 的时候就会出现这个问题。

1. Firefox 会提出 MediaStreamError，其名称属性设置为“TypeError”，以及一个消息“音频和/或视频被请求”。
2. Chrome 会出现一条“TypeError：无法在‘MediaDevices’上执行‘getUserMedia’：必须至少请求一个音频和视频”。

### FireFox Chrome 错误对照表

| FIREFOX 56           | CHROME 62                   | 错误处理                   |
| -------------------- | --------------------------- | -------------------------- |
| NotFoundError        | DevicesNotFoundError        | 设备没有找到，如何处理     |
| NotReadableError     | TrackStartError             | 获取其他设备信息，获取不到 |
| OverconstrainedError | ConstraintNotSatisfiedError | 请求的视频、音频格式不支持 |
| NotAllowedError      | PermissionDeniedError       | 权限不足的问题             |

参考链接：<https://blog.addpipe.com/common-getusermedia-errors/>
