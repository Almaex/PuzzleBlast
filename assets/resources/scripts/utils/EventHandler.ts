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
    handlers: EventHandler[] = new Array()
    add(owner, cb) {
        let handler = owner instanceof EventHandler ? owner: new EventHandler(owner, cb)
        this.handlers.push(handler)
    }
    dispatch(args?: T) {
        this.handlers.filter(h => {
            return h.owner.node != undefined && h.owner.node.isValid
        })
        this.handlers.forEach(h => h.onEvent(args)) 
        return true
    }
}

export function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]
    }
  }
  
  export function chunkArray(arr, size) {
    return arr.length > size
      ? [arr.slice(0, size), ...this.chunkArray(arr.slice(size), size)]
      : [arr]
  }