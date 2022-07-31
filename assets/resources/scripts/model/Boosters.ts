import Global from "../Global";
import { Event } from "../utils/EventHandler";
import { TileState } from "./Tile";



export class Booster {
    private _type: TileState
    private _count: number = 0

    get type() { return this._type }
    get count() { return this._count }

    set type(t) { this._type = t }
    set count(c) { this._count = c }

    onChangeCount = new Event

    decrementCount() {
        this._count -- 
        this.onChangeCount.dispatch()
    }
}

export class BoostersController {
    boostersList = []
    private _boosters: Array<Booster> = []

    constructor() {
        this.boostersList.push(TileState.Bomb, TileState.Mix)
        
        this.boostersList.forEach((type) => {
            let booster = new Booster()
            booster.type = type
            booster.count = Global.config.defaultBoosterCount
            this._boosters.push(booster)
        })
    }

    get boosters() { return this._boosters }

    decremenBoosterCount(type: TileState) {
        let booster = this._findBooster(type)
        booster.decrementCount()
    }

    private _findBooster(type: TileState) {
        return this._boosters.find(b => b.type == type)
    }
}