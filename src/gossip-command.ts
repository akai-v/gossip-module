/*
 * Created on Mon Apr 20 2020
 *
 * Copyright (c) storycraft. Licensed under the MIT Licence.
 */

import { CommandInfo, BotCommandEvent, ModuleLogger } from "@akaiv/core";
import { StudyManager } from "./study-manager";

export class ToggleCommand implements CommandInfo {

    constructor(private studyManager: StudyManager) {

    }

    get CommandList() {
        return [ 'toggle' ];
    }

    get Usage() {
        return 'gossip/toggle';
    }

    get Description() {
        return '봇 응답 설정 토글';
    }

    async onCommand(e: BotCommandEvent, logger: ModuleLogger) {
        let newFlag = !(await this.studyManager.getChannelResponseFlag(e.Channel));

        await this.studyManager.setChannelResponseFlag(e.Channel, newFlag);

        await e.Channel.sendText(`응답 설정이 ${newFlag} 로 설정되었습니다`);
    }

}

export class InfoCommand implements CommandInfo {

    constructor(private studyManager: StudyManager) {
        
    }

    get CommandList() {
        return [ 'info' ];
    }

    get Usage() {
        return 'gossip/info';
    }

    get Description() {
        return '헛소리 학습 정보';
    }

    async onCommand(e: BotCommandEvent, logger: ModuleLogger) {
        e.Channel.sendText(`전체 학습한 채팅량: ${await this.studyManager.getTotalMessage()} (개)`);
    }

}
