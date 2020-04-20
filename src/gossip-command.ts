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

export class PercentCommand implements CommandInfo {

    constructor(private studyManager: StudyManager) {
        
    }

    get CommandList() {
        return [ 'percent' ];
    }

    get Usage() {
        return 'gossip/percent <문자열>';
    }

    get Description() {
        return '헛소리 학습 정보';
    }

    async onCommand(e: BotCommandEvent, logger: ModuleLogger) {
        if (e.RawArgument.length < 1) {
            await e.Channel.sendText(`사용법: ${this.Usage}`);
            return;
        }

        let chatkey = await this.studyManager.getChatKey(e.RawArgument);

        if (!chatkey) await e.Channel.sendText(`${e.RawArgument} 는 학습되지 않았습니다`);

        let str = `${e.RawArgument} 의 학습정보\n\n`;

        let connection = chatkey!.connection;

        let keyTotal = 0;

        for (let key in connection) {
            keyTotal += (connection[key] || 0);
        }

        let ratio = (keyTotal / (await this.studyManager.getTotalMessage())) * 100;
        let percent = Math.max(Math.min((Object.keys(connection).length / keyTotal) * Math.min(Object.keys(connection).length / 3, 1) * 0.8, 0.7), 0.17) * 100;

        str += `\n\n전체 중 비율 ${ratio.toFixed(2)} %\n\n응답률: ${percent.toFixed(2)} %`;

        await e.Channel.sendText(str);
    }

}
