export class Timer {
    constructor(delaySeconds: number, cb: () => void) {
        cc.tween(this).delay(delaySeconds).call(cb).start()
    }
}