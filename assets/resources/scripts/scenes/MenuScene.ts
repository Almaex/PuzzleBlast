const {ccclass, property} = cc._decorator;

@ccclass
export default class MenuScene extends cc.Component {
    @property(cc.Node) startButtonNode: cc.Node = null
    @property(cc.Node) raitingButtonNode: cc.Node = null
    @property(cc.Node) blackScreen: cc.Node = null

    start() {
        this.blackScreen.active = true
        cc.tween(this.blackScreen)
            .delay(0.3)
            .to(0.5, { opacity: 0 })
            .call(() => this.blackScreen.active = false)
            .start()
    }

    onStartButton() {
        cc.director.loadScene("GameScene")
    }
    
    onRaitingButton() {
        
    }

}
