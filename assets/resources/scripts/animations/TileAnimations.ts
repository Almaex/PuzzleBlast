import Global from "../Global"
import TileNode from "../nodes/TileNode"

export const enum TileAnimationType {
    NoConnected,
    Removing,
    Droping,
    Emergence
}

export class TileAnimationController {

    private _tileSize: number = 0
    private _tile: TileNode = null

    animate(tile: TileNode, type: TileAnimationType) {
        this._tile = tile
        this._tileSize = tile.size
        switch(type) {
            case TileAnimationType.NoConnected:
                return (this._noConnected())
            case TileAnimationType.Removing:
                return (this._removing())
            case TileAnimationType.Droping:
                return (this._droping())
            case TileAnimationType.Emergence:
                return (this._emergence())
            default:
                cc.log("No valid animation!")
        }
    }


    private _noConnected() {
        let tileNode = this._tile.node
        const angle = 30
        const angleTime = 0.08 
        cc.tween(tileNode)
            .to(angleTime, { angle: angle })
            .to(angleTime, { angle: -angle })
            .to(angleTime, { angle: 0 })
            .start()
    }
    
    private _removing = () => new Promise(r => {
        let tileNode = this._tile.node
        const scaleTime2 = 0.1 
        let scale = cc.tween()
            .to(scaleTime2, { scale: 0 })
        cc.tween(tileNode)
            .then(scale) 
            .call(() => { tileNode.opacity = 0; tileNode.scale = 1 })
            .call(r)
            .start()
    })

    private _droping = () => new Promise(r => {
        let tileNode = this._tile.node
        const speed = 0.4
        
        let endPos = cc.v3(this._tile.tilePosition.y * this._tileSize, -this._tile.tilePosition.x * this._tileSize)
        const delay = 0.01
        
        cc.tween(tileNode)
            .delay(delay)
            .to(speed, { position: endPos }, { easing: 'fade' })
            .call(r)
            .start()
    })

    private _emergence = () => new Promise(r => {
        let tileNode = this._tile.node
        const speed = 0.6
        
        let endPos = cc.v3(this._tile.tilePosition.y * this._tileSize, -this._tile.tilePosition.x * this._tileSize)
        let startPos = cc.v3(this._tile.tilePosition.y * this._tileSize, cc.winSize.height / 2, 0)
        const delay = 0.01
        
        cc.tween(tileNode)
            .call(() => { tileNode.opacity = 255; tileNode.scale = 1; tileNode.position = startPos})
            .delay(delay)
            .to(speed, { position: endPos }, { easing: 'circInOut' })
            .call(r)
            .start()
    })
}