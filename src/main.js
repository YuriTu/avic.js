import DecoderWorker from "./Decoder.worker.js";

export default class Main {
    constructor(){
        this.worker = new DecoderWorker();
    }

    decode(buffer) {
        return new Promise((resolve,reject) => {
            this.worker.postMessage({
                method: 'parse',
                options:buffer
            });

            this.worker.onmessage = (e) => {
                let res = e.data.res;
                switch(e.data.method) {
                    case 'success':
                        resolve(res);
                        break;
                    case 'fail':
                        reject(res);
                        break;
                    default:
                        console.error('unknow method');
                }
            }
        })
    }
}