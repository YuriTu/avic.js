# avic.js
avic.js 用于解析avif图片与avic图片。

## about avif and avic
avif是新一代web图片格式，意在取代webp。相对于Apple公司主推的Heic\Heif格式，avif不存在Hevc的版权问题。

avif&avic在chrome85+支持原生渲染。avif是静态图片格式，avic是动态图片格式。

通过avic.js 可以在chrome57+以上支持avif与avic的浏览器渲染。

## different with avif.js
1. avic.js重点在于动图格式渲染，同时支持avif静态图与avif动态图。（很多动态图一样以avif作为后缀名，但是实际是avic图片）
2. 不使用ServiceWorker。所以也无需第一次的刷新，对于一些2C产品刷新是不可接受的。
3. 提供每一帧的RGBA数据，对于一些 上传、编辑 类的产品需求，avif.js默认的img标签渲染不太能完全覆盖，avic.js希望能够解决这部分需求。

## usage

### example
解码图片并循环播放
```js

let d = new DecoderWorker();
d.parse(url).then(rs => {
    let {width,height,frames} = rs;
    let timestamp = performance.now();
    let currentIndex = 0;
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');
    c.width = width;
    c.height = height;

    c.style.display = 'block';
    document.body.appendChild(c);

    const renderAni = () => {
        requestAnimationFrame(renderAni)
        let index = currentIndex % frames.length;
        if ((currentIndex > frames.length - 1) ) {
            return;
        }
        let data = frames[index];
        if ((performance.now() - timestamp < data.delay)) {
            return;
        }
        timestamp = performance.now()
        ctx.putImageData(data.data,0,0);
        currentIndex++;
    };
    renderAni();
})
```
### api

实例化解码器
```js
const Decoder = new Decoder();
```

解析图片
```js
let resolveParam = DecoderWorker.parse(param)
```


获得版本号
静态方法
```js
DecoderWorker.VERSION()
```

### tip

1. Promise 参数定义
```typescript
// promise 回调参数
type resolveParam = {
    frames:imageInfo[],
    width:number, // 画布宽高
    height:number, 
    duration:number, // 动图总时长
    playCount:number // 播放多少次
}

type imageInfo = {
    data:window.ImageData,
    delay:number, // 下一帧的延迟
}
```