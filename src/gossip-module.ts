import { BotModule, DatabaseEntry, BotMessageEvent, Channel, UserMessage, AttachmentTemplate, TemplateAttachment, AttachmentType } from "@akaiv/core";
import { ToggleCommand, InfoCommand, PercentCommand } from "./gossip-command";
import { StudyManager } from "./study-manager";
import * as Crypto from "crypto";
import * as File from "fs";
import { join } from "path";

/*
 * Created on Sat Oct 26 2019
 *
 * Copyright (c) storycraft. Licensed under the MIT Licence.
 */

export class GossipModule extends BotModule {

    public static readonly SORRY_FOR_THE_INCONVENIENCE = join(__dirname, '..', 'resources', 'forbidden.png');

    private studyManager: StudyManager;

    private lastMessageMap: WeakMap<Channel, UserMessage>;
    private notifyMap: WeakMap<Channel, boolean>;

    private urlRegex = /(http(s)?:\/\/?\/?[^\s]+)/g;

    public sorryForTheInconvenienceImg: Buffer | null;

    constructor({ studyDB }: {
        studyDB: DatabaseEntry
    }) {
        super();

        this.lastMessageMap = new WeakMap();
        this.notifyMap = new WeakMap();
        this.studyManager = new StudyManager(studyDB);

        this.sorryForTheInconvenienceImg = null;

        this.CommandManager.addCommand(new ToggleCommand(this.studyManager));
        this.CommandManager.addCommand(new InfoCommand(this.studyManager));
        this.CommandManager.addCommand(new PercentCommand(this.studyManager));

        this.on('message', this.onMessage.bind(this));

        File.readFile(GossipModule.SORRY_FOR_THE_INCONVENIENCE, (e, data) => {
            if (e) return;

            this.sorryForTheInconvenienceImg = data;
        });
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
        if (e.IsCommand || e.Message.Sender.IsClientUser) return;
        
        await this.processGossip(e.Message);
    }

    protected async processGossip(message: UserMessage, multiplier: number = 1) {
        if (!await (this.studyManager.canStudy(message))) return;

        let text = message.Text.trim();
        let lastMessage = this.lastMessageMap.get(message.Channel);
        this.lastMessageMap.set(message.Channel, message);

        if (!lastMessage) return;

        let total = await this.studyManager.getTotalMessage();
        await this.studyManager.setTotalMessage(total + 1);

        let lastText = lastMessage.Text.trim();

        let textHash = this.studyManager.transformTextToKey(text);
        let lastTextHash = this.studyManager.transformTextToKey(lastText);

        let random: number = Crypto.randomBytes(2).readUInt16LE(0); // 0 - 65535

        let lastChatKey = await this.studyManager.getChatKeyByHash(lastTextHash);

        if (!lastChatKey) {
            this.studyManager.setChatKey(this.studyManager.createNewChatKey(lastText));
        }

        
        if (lastText !== text || Math.random() < 0.1) {
            let newLastChatRefCount: number = await this.studyManager.getChatKeyHashConnectionRefCount(lastTextHash, textHash) + 1;
            await this.studyManager.updateChatKeyHashConnectionRefCount(lastTextHash, textHash, newLastChatRefCount);
        }



        let chatKey = await this.studyManager.getChatKeyByHash(textHash);

        if (!chatKey) {
            let wordList = text.split(' ');

            if (wordList.length < 2) return;

            chatKey = await this.studyManager.getChatKey(wordList[Math.floor(wordList.length / 2)]);
        }

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

        if (!(await this.studyManager.getChannelResponseFlag(message.Channel))) return;

        let totalKeyRefCount = 0;

        for (let connectionKey of connectionKeys) {
            totalKeyRefCount += chatKey.connection[connectionKey] || 0;
        }

        let offset = message.Timestamp - lastMessage.Timestamp;

        let ratio = Math.max(Math.min((connectionKeys.length / totalKeyRefCount) * Math.min(connectionKeys.length / 3, 1) * 0.72 * multiplier * (offset / 2800), 0.7), 0.17);
        
        if (Math.random() >= ratio) return;

        let targetArea = Math.floor((random / 65535) * totalKeyRefCount);

        let targetKey: string = '';
        
        let i = 0;
        let weight = 0;
        for (let connectionKey of connectionKeys) {
            weight = chatKey.connection[connectionKey] || 0;

            if (targetArea >= i && targetArea < i + weight) {
                targetKey = connectionKey;
                break;
            }

            i += weight;
        }

        if (targetKey === '') return;
        
        let targetChatKey = await this.studyManager.getChatKeyByHash(targetKey);

        if (!targetChatKey) return;

        let nonSensitiveText = targetChatKey.text.replace(this.urlRegex, ' [삐] ').trim();

        if (targetChatKey.text !== nonSensitiveText && !this.notifyMap.has(message.Channel) && this.sorryForTheInconvenienceImg) {
            message.Channel.sendRichTemplate(new AttachmentTemplate('* 민감한 내용이 검열되었습니다.', new TemplateAttachment(AttachmentType.IMAGE, 'sad.png', this.sorryForTheInconvenienceImg)));

            this.notifyMap.set(message.Channel, true);
        }

        let sentList = await message.Channel.sendText(nonSensitiveText);

        for (let sentMessage of sentList) {
            if (sentMessage.AttachmentList.length > 0 || sentMessage.Text !== targetChatKey.text) continue;
            await this.processGossip(sentMessage, 1.1);
            break;
        }
    }

}