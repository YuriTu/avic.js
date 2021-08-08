import Main from "./main"
import { blob2buffer, url2buffer } from "./util";


export default class AvicDecoder {
    static VERSION(){
        return '__VERSION'
    }

    _reset(){
        this.decoder = new Main();
    }

    _decode(bf){
        return this.decoder.decoder(bf)
    }

    async _parseWithUrl(url) {
        const bf = await url2buffer(url);
        return this._parseWithArraybuffer(bf);
    }

    async _parseWithBLob(blob) {
        const bf = await blob2buffer(blob);
        return this._parseWithArraybuffer(bf);
    }

    async _parseWithArraybuffer(bf) {
        let rs = await this._decode(bf);
        return {
            frames:rs.imageBuffer,
            width:rs.imageWidth,
            height:rs.imageHeight
        }

    }

    async parse(origin) {
        let rs = null;
        if (typeof origin === 'string') {
            rs = await this._parseWithUrl(origin);
        } else if (origin instanceof Blob) {
            rs = await this._parseWithBLob(origin);
        } else if (origin instanceof ArrayBuffer) {
            rs = await this._parseWithArraybuffer(origin);
        }
        return rs;
    }
}