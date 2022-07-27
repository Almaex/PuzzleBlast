export class EventHandler {
    owner = null
    isComponent = false
    constructor(owner, onEvent) {
        this.owner = owner
        this.cbOnEvent = onEvent
        this.isComponent = owner instanceof cc.Component
    }
    cbOnEvent = null
    onEvent(args?) { this.cbOnEvent(args) }
}
export class Event<T = any> {
    private _handlers: EventHandler[] = new Array()
    add(owner, cb) {
        let handler = owner instanceof EventHandler ? owner: new EventHandler(owner, cb)
        this._handlers.push(handler)
    }
    dispatch(args?: T) {
        this._handlers.filter(h => {
            return h.owner.node != undefined && h.owner.node.isValid
        })
        this._handlers.forEach(h => h.onEvent(args)) 
        return true
    }
}
