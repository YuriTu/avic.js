import Module from './lib/codecs/avif/avif_dec';
const wasmPath = '';

class DecoderWorker {};

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