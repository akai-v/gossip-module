"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@akaiv/core");
const gossip_command_1 = require("./gossip-command");
const study_manager_1 = require("./study-manager");
const Crypto = require("crypto");
class GossipModule extends core_1.BotModule {
    constructor({ studyDB }) {
        super();
        this.lastMessageMap = new WeakMap();
        this.studyManager = new study_manager_1.StudyManager(studyDB);
        this.CommandManager.addCommand(new gossip_command_1.ToggleCommand(this.studyManager));
        this.CommandManager.addCommand(new gossip_command_1.InfoCommand(this.studyManager));
        this.CommandManager.addCommand(new gossip_command_1.PercentCommand(this.studyManager));
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
    async loadModule() {
    }
    async unloadModule() {
    }
    async onMessage(e) {
        await this.processGossip(e.Message);
    }
    async processGossip(message, processClient = false, multiplier = 1) {
        if (!processClient && message.Sender.IsClientUser || !await (this.studyManager.canStudy(message)))
            return;
        let text = message.Text;
        let lastMessage = this.lastMessageMap.get(message.Channel);
        this.lastMessageMap.set(message.Channel, message);
        let total = await this.studyManager.getTotalMessage();
        await this.studyManager.setTotalMessage(total + 1);
        if (!lastMessage)
            return;
        let lastText = lastMessage.Text;
        let textHash = this.studyManager.transformTextToKey(text);
        let lastTextHash = this.studyManager.transformTextToKey(lastText);
        let random = Crypto.randomBytes(2).readInt16LE(0);
        let lastChatKey = await this.studyManager.getChatKeyByHash(lastTextHash);
        if (!lastChatKey) {
            this.studyManager.setChatKey(this.studyManager.createNewChatKey(lastText));
        }
        let newLastChatRefCount = await this.studyManager.getChatKeyHashConnectionRefCount(lastTextHash, textHash) + 1;
        await this.studyManager.updateChatKeyHashConnectionRefCount(lastTextHash, textHash, newLastChatRefCount);
        let chatKey = await this.studyManager.getChatKeyByHash(textHash);
        if (!chatKey) {
            let wordList = text.split(' ');
            if (wordList.length < 2)
                return;
            chatKey = await this.studyManager.getChatKey(wordList[Math.floor(wordList.length / 2)]);
        }
        if (!chatKey)
            return;
        let connectionKeys = Object.keys(chatKey.connection);
        if (connectionKeys.length < 1)
            return;
        if (random < 10240) {
            let targetKey = connectionKeys[Math.min(Math.floor(connectionKeys.length * Math.random()), connectionKeys.length - 1)];
            let targetChatKey = await this.studyManager.getChatKeyByHash(targetKey);
            if (!targetChatKey)
                return;
            let targetKeyConnectionKeys = Object.keys(targetChatKey.connection);
            let studyKey = targetKeyConnectionKeys[Math.min(Math.floor(targetKeyConnectionKeys.length * Math.random()), targetKeyConnectionKeys.length - 1)];
            let newStudyKeyRefCount = (await this.studyManager.getChatKeyHashConnectionRefCount(textHash, studyKey)) + 1;
            await this.studyManager.updateChatKeyHashConnectionRefCount(textHash, studyKey, newStudyKeyRefCount);
        }
        if (!(await this.studyManager.getChannelResponseFlag(message.Channel)))
            return;
        let totalKeyRefCount = 0;
        for (let connectionKey of connectionKeys) {
            totalKeyRefCount += chatKey.connection[connectionKey] || 0;
        }
        let offset = message.Timestamp - lastMessage.Timestamp;
        let ratio = Math.max(Math.min((connectionKeys.length / totalKeyRefCount) * Math.min(connectionKeys.length / 3, 1) * 0.72 * multiplier * (offset / 3700), 0.7), 0.17);
        if (Math.random() >= ratio)
            return;
        let targetArea = Math.floor((random / 65535) * totalKeyRefCount);
        let targetKey = '';
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
        console.log('targetKey: ' + targetKey + '\n' + 'targetArea: ' + targetArea);
        if (targetKey === '')
            return;
        let targetChatKey = await this.studyManager.getChatKeyByHash(targetKey);
        if (!targetChatKey)
            return;
        let sentList = await message.Channel.sendText(targetChatKey.text);
        for (let sentMessage of sentList) {
            if (sentMessage.AttachmentList.length > 0 || sentMessage.Text !== targetChatKey.text)
                continue;
            await this.processGossip(sentMessage, true, 1.1);
            break;
        }
    }
}
exports.GossipModule = GossipModule;
//# sourceMappingURL=gossip-module.js.map