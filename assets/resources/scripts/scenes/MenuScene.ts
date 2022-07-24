const {ccclass, property} = cc._decorator;

@ccclass
export default class MenuScene extends cc.Component {
    @property(cc.Node) startButtonNode: cc.Node = null
    @property(cc.Node) raitingButtonNode: cc.Node = null

    onLoad() {
        cc.log("[LOG] MenuScene")
    }
    onStartButton() {
        cc.director.loadScene("GameScene")
    }
    onRaitingButton() {
        
    }

}
