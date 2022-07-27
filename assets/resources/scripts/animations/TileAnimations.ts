import Global from "../Global"
import TileNode from "../nodes/TileNode"

export const enum TileAnimationType {
    NoConnected,
    Removing,
    Droping,
    Emergence,
    Mix
}

export class TileAnimationController {

    private _tileSize: number = 0
    private _animationSpeed = 1
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
            case TileAnimationType.Mix:
                return (this._mix())
            default:
                cc.log("No valid animation!")
        }
    }


    private _noConnected() {
        let tileNode = this._tile.node
        const angle = 30
        const angleTime = 0.08 * this._animationSpeed
        let zIndex = +("" + Global.config.gridSize.x + Global.config.gridSize.y + 1)
        cc.tween(tileNode)
            .call(() => tileNode.zIndex = zIndex)
            .to(angleTime, { angle: angle })
            .to(angleTime, { angle: -angle })
            .to(angleTime, { angle: 0 })
            .start()
    }
    
    private _removing = () => new Promise  (r => {
        let tileNode = this._tile.node
        const scaleTime1 = 0.08 
        const scaleTime2 = 0.1 
        let scale = cc.tween()
            .by(scaleTime1 * this._animationSpeed, { scale: 0.1 })
            .to(scaleTime2 * this._animationSpeed, { scale: 0 })
        cc.tween(tileNode)
            .then(scale) 
            .call(() => { tileNode.opacity = 0; tileNode.scale = 1 })
            .call(r)
            .start()
    })

    private _droping = () => new Promise (r => {
        let tileNode = this._tile.node
        let distance = this._tile.tilePosition.x + tileNode.position.y / this._tileSize
        const baseSpeed = 0.2
        
        let endPos = cc.v3(this._tile.tilePosition.y * this._tileSize, -this._tile.tilePosition.x * this._tileSize)
        const baseDelay = 0.018
        const currentDelay = baseDelay * (Global.config.gridSize.y - this._tile.tilePosition.x + 1)
        
        cc.tween(tileNode)
            .delay(currentDelay * this._animationSpeed)
            .to(baseSpeed * distance * this._animationSpeed, { position: endPos }, { easing: 'quadIn' })
            .call(r)
            .start()
    })
    private _emergence = () => new Promise( r => {
        let tileNode = this._tile.node
        const scaleTime1 = 0.2 
        const scaleTime2 = 0.1 
        let scale = cc.tween()
            .to(scaleTime1 * this._animationSpeed, { scale: 1.1 })
            .to(scaleTime2 * this._animationSpeed, { scale: 1 })
        let endPos = cc.v3(this._tile.tilePosition.y * this._tileSize, -this._tile.tilePosition.x * this._tileSize)
        cc.tween(tileNode)
            .call(() => {
                tileNode.scale = 0
                tileNode.position = endPos
                tileNode.opacity = 255
            })
            .then(scale)
            .call(r)
            .start()
    })

    private _mix = () => new Promise(r => {
        let tileNode = this._tile.node
        let endPos = cc.v3(this._tile.tilePosition.y * this._tileSize, -this._tile.tilePosition.x * this._tileSize)
        const delay = 0.2
        
        cc.tween(tileNode)
            .to(0.2, { scale: 0 })
            .call(() => {
                tileNode.position = endPos
            })
            .delay(delay)
            .to(0.2, { scale: 1 })
            .call(r)
            .start()
    })
}