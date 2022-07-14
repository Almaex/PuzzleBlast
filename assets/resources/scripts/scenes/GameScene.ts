const {ccclass, property} = cc._decorator;

@ccclass
export default class GameScene extends cc.Component {
    @property(cc.Sprite) logo: cc.Sprite = null

    onLoad() {
        
    }
}
