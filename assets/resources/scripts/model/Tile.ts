import { Event } from "../utils/EventHandler"

export const enum TileColor {
    Blue,
    Red,
    Green,
    Orange,
    Violet
}

export const enum TileState {
    Empty,
    Normal,
    Booster
}

export class Tile {
    private _position: cc.Vec2
    private _color: TileColor
    private _state: TileState

    onTileClick = new Event
    onStateUpdated = new Event
    noCombo = new Event

    get position() { return this._position }
    get color() { return this._color }
    get state() { return this._state }
    get removed() { return this._state == TileState.Empty }
    get isNormal() { return this._state != TileState.Empty }
    set state(state: TileState) { this._state = state }

    constructor(pos: cc.Vec2) {
        this._position = pos
        this._color = this.getRandomTile()
        this._state = TileState.Normal
    }
    getRandomTile() {
        let min = TileColor.Blue
        let max = TileColor.Violet

        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    updateState() {
        this._state = TileState.Normal
        this._color = this.getRandomTile()
        this.onStateUpdated.dispatch()
    }
    onClick() {
        cc.log("[LOG]tile.color", this._color)
        this.onTileClick.dispatch()
    }
    remove() {
        this.state = TileState.Empty
    }
    updatePos(newPos: cc.Vec2) {
        this._position = newPos
    }

}