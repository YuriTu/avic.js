import Main from "./main"


export default class AvicDecoder {
    static VERSION(){
        return '__VERSION'
    }

    _reset(){
        this.decoder = new Main();
    }

    async _parseWithUrl(url) {

    }

    async _parseWithBLob(blob) {

    }

    async _parseWithArraybuffer() {

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