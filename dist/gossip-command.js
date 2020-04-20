"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ToggleCommand {
    constructor(studyManager) {
        this.studyManager = studyManager;
    }
    get CommandList() {
        return ['toggle'];
    }
    get Usage() {
        return 'gossip/toggle';
    }
    get Description() {
        return '봇 응답 설정 토글';
    }
    async onCommand(e, logger) {
        let newFlag = !(await this.studyManager.getChannelResponseFlag(e.Channel));
        await this.studyManager.setChannelResponseFlag(e.Channel, newFlag);
        await e.Channel.sendText(`응답 설정이 ${newFlag} 로 설정되었습니다`);
    }
}
exports.ToggleCommand = ToggleCommand;
class InfoCommand {
    constructor(studyManager) {
        this.studyManager = studyManager;
    }
    get CommandList() {
        return ['info'];
    }
    get Usage() {
        return 'gossip/info';
    }
    get Description() {
        return '헛소리 학습 정보';
    }
    async onCommand(e, logger) {
        e.Channel.sendText(`전체 학습한 채팅량: ${await this.studyManager.getTotalMessage()} (개)`);
    }
}
exports.InfoCommand = InfoCommand;
//# sourceMappingURL=gossip-command.js.map