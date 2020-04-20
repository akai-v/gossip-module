import { BotModule, DatabaseEntry, BotMessageEvent, Channel } from "@akaiv/core";
import { ToggleCommand, InfoCommand, PercentCommand } from "./gossip-command";
import { StudyManager } from "./study-manager";
import * as Crypto from "crypto";

/*
 * Created on Sat Oct 26 2019
 *
 * Copyright (c) storycraft. Licensed under the MIT Licence.
 */

export class GossipModule extends BotModule {

    private studyManager: StudyManager;

    private lastMessageMap: WeakMap<Channel, string>;

    constructor({ studyDB }: {
        studyDB: DatabaseEntry
    }) {
        super();

        this.lastMessageMap = new WeakMap();
        this.studyManager = new StudyManager(studyDB);

        this.CommandManager.addCommand(new ToggleCommand(this.studyManager));
        this.CommandManager.addCommand(new InfoCommand(this.studyManager));
        this.CommandManager.addCommand(new PercentCommand(this.studyManager));

        this.on('message', this.onMessage.bind(this));
    }

    get Name() {
        return 'Gossip';
    }

    get Description() {
        return '아무말 대잔치';
    }

    get Namespace() {
        return 'gossip';
    }

    protected async loadModule(): Promise<void> {

    }

    protected async unloadModule(): Promise<void> {

    }

    protected async onMessage(e: BotMessageEvent) {
        if (!await (this.studyManager.canStudy(e.Message))) return;

        let text = e.Message.Text;
        let lastText = this.lastMessageMap.get(e.Message.Channel);
        this.lastMessageMap.set(e.Message.Channel, text);

        let total = await this.studyManager.getTotalMessage();
        await this.studyManager.setTotalMessage(total + 1);

        if (!lastText) return;

        let textHash = this.studyManager.transformTextToKey(text);
        let lastTextHash = this.studyManager.transformTextToKey(lastText);

        let random: number = Crypto.randomBytes(2).readInt16LE(0); // 0 - 65535

        let lastChatKey = await this.studyManager.getChatKeyByHash(lastTextHash);

        if (!lastChatKey) {
            this.studyManager.setChatKey(this.studyManager.createNewChatKey(lastText));
        }

        let newLastChatRefCount: number = await this.studyManager.getChatKeyHashConnectionRefCount(lastTextHash, textHash) + 1;
        await this.studyManager.updateChatKeyHashConnectionRefCount(lastTextHash, textHash, newLastChatRefCount);



        let chatKey = await this.studyManager.getChatKeyByHash(textHash);

        if (!chatKey) return;

        let connectionKeys = Object.keys(chatKey.connection);
        if (connectionKeys.length < 1) return;

        if (random < 10240) { // LEARN SOMETHING FROM AFTER TREE
            let targetKey = connectionKeys[Math.min(Math.floor(connectionKeys.length * Math.random()), connectionKeys.length - 1)];
            let targetChatKey = await this.studyManager.getChatKeyByHash(targetKey);

            if (!targetChatKey) return;

            let targetKeyConnectionKeys = Object.keys(targetChatKey.connection);
            let studyKey = targetKeyConnectionKeys[Math.min(Math.floor(targetKeyConnectionKeys.length * Math.random()), targetKeyConnectionKeys.length - 1)];

            let newStudyKeyRefCount = (await this.studyManager.getChatKeyHashConnectionRefCount(textHash, studyKey)) + 1;
            await this.studyManager.updateChatKeyHashConnectionRefCount(textHash, studyKey, newStudyKeyRefCount);
        }

        let totalKeyRefCount = 0;

        for (let connectionKey of connectionKeys) {
            totalKeyRefCount += chatKey.connection[connectionKey] || 0;
        }

        let ratio = totalKeyRefCount / total;
        
        if (Math.random() >= Math.sqrt(ratio + Math.sin(ratio * 20) * 0.1)) return;

        let targetKey = connectionKeys[Math.min(Math.floor(connectionKeys.length * Math.random()), connectionKeys.length - 1)];
        let targetChatKey = await this.studyManager.getChatKeyByHash(targetKey);

        if (!targetChatKey) return;

        e.Message.Channel.sendText(targetChatKey.text);
    }

}