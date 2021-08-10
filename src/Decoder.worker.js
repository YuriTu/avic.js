import Module from './lib/codecs/avif/avif_dec';
const wasmPath = '';

class DecoderWorker {
    _decoder= null;
    _byteArrayToLong = (byteArray) => {
        var value = 0;
        for (var i = byteArray.length - 1; i >= 0; i--) {
            value = value * 256 + byteArray[i];
        }
        return value;
    };
    _getMeta = (startPtr) => {
        return true;
    };

    _mallocDataIntoHEAP = (u8a) => {
        let ptr = this._decoder._malloc(u8a.length);

        if (!ptr){
            throw new Error("_malloc failed");
        }
        this._decoder.HEAP8.set(u8a,ptr);
        return ptr;
    };
    init() {
        if (!!this._decoder) return Promise.resolve();

        return new Promise((resolve,reject) => {
            let promise = Module({
                locateFile:() => {
                    return wasmPath;
                }
            });
            promise.then(rs => {
                this._decoder = rs;
                resolve();
            })
        })
    }

    getPointerValue(pointer,length){
        // 80ms优化
        let arr = this._decoder.HEAPU8.subarray(pointer, pointer + length);
        return this._byteArrayToLong(arr);
        // return this._decoder.getValue(pointer,length2TypeMap[length])
    }
    _readArrValue(pointer,bit,length){
        let vArr = this._decoder.HEAPU8.subarray(pointer, pointer + bit * length);
        let rs = [];
        for (let i = 0; i < length; i++){
            let tempArr = vArr.subarray(i * bit, (i + 1) * bit );
            let value = this._byteArrayToLong(tempArr);
            rs.push(value);
        }
        return rs;
    }
    _getFrame(pointer,length_list){

        let step_pointer = [length_list[0]]
        let all_frame_lengtgh = length_list.reduce((i,j) => {
            let value = i + j;
            step_pointer.push(value);
            return value;
        });
        let rgbaArr = this._decoder.HEAPU8.subarray(pointer, pointer + all_frame_lengtgh);
        let frame = step_pointer.map((item,index) => {
            let frame_arr = null;
            if (index == 0){
                frame_arr = rgbaArr.subarray(0, item);
            } else {
                frame_arr = rgbaArr.subarray(step_pointer[index - 1], item);
            }
            return frame_arr;
        })
        return frame;
    }
    decode(arrayBuffer){
        // 解析meta
        const bitLength = 4;
        const u8ByteLength = 4;
        // 动图解码静图兼容处理
        return this.decodeAni(arrayBuffer);
        // return this.decodeStatic(arrayBuffer)
    }
    // 如果能在c层面磨平，就不要在js处理
    decodeStatic(arrayBuffer){
        let buffer = new Uint8Array(arrayBuffer);
        performance.mark('wasm_decode_s');
        const imageData = this._decoder.decode(arrayBuffer);
        performance.mark('wasm_decode_e');
        performance.measure('wasm_decode','wasm_decode_s','wasm_decode_e');
        console.log('wasm_decode time:', performance.getEntriesByName('wasm_decode')[0].duration);
        let width = imageData.width;
        let height = imageData.height;
        return {
            code:0,
            imageWidth: width,
            imageHeight: height,
            imageDuration: 0,
            imageBuffer:[{data:imageData,duration:0}]
        }
    }
    decodeAni(arrayBuffer) {
        const result = this._decoder.decodeAni(arrayBuffer);
        let width = 0;
        let height = 0;
        let images = [];
        if (result.images.length) {
            width = result.images[0].width;
            height = result.images[0].height;
            let duration = result.duration * 1000 / result.images.length;
            images = result.images.map(i => {
                return {
                    data:i,
                    delay: duration
                }
            })
        }
        return {
            code:0,
            imageWidth: width,
            imageHeight: height,
            imageDuration: result.duration,
            imageBuffer:images
        }
    }

};

const successCB = (rs) => {
    return {
        method:'success',
        res: Object.assign({},{
            logs:{
                decodeEnd:performance.now()
            }
        },rs)
    }
}
const failCB = (rs) => {
    return {
        method:'fail',
        res: Object.assign({},{
            logs:{
                failPhase:rs.msg,
                decodeEnd:performance.now()
            }
        },rs)
    }
}

const decoder = new DecoderWorker();


self.onmessage = (e) => {
    switch(e.data.method) {
        case 'parse':
            decoder.init().then(() => {
                let rs = decoder.decoder(e.data.options);
                if (rs.code === 0) {
                    return self.postMessage(successCB(rs))
                }
            })
            return self.postMessage(failCB(rs));
            break;
        default:
            console.error('unknow method');
    }
} 