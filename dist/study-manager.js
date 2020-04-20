"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Crypto = require("crypto");
class StudyManager {
    constructor(dbEntry) {
        this.dbEntry = dbEntry;
    }
    async canStudy(message) {
        return !message.Sender.IsClientUser && message.AttachmentList.length < 1;
    }
    async canResponse(message) {
        return this.getChannelResponseFlag(message.Channel);
    }
    async getTotalMessage() {
        if (!(await this.dbEntry.has('total')))
            return 0;
        return (await this.dbEntry.get('total'));
    }
    async setTotalMessage(count) {
        await this.dbEntry.set('total', count);
    }
    async getKeyEntry() {
        return this.dbEntry.getEntry('keys');
    }
    async getSettingsEntry() {
        return this.dbEntry.getEntry('settings');
    }
    async getChannelResponseFlag(channel) {
        let entry = await this.getSettingsEntry();
        if (!await (entry.has(channel.IdentityId)))
            return false;
        return (await entry.get(channel.IdentityId));
    }
    async setChannelResponseFlag(channel, flag) {
        let entry = await this.getSettingsEntry();
        return entry.set(channel.IdentityId, flag);
    }
    transformTextToKey(text) {
        let hash = Crypto.createHash('md5');
        hash.update(text);
        return hash.digest('hex');
    }
    async getChatKey(text) {
        return this.getChatKeyByHash(this.transformTextToKey(text));
    }
    async getChatKeyByHash(hash) {
        let keyEntry = await this.getKeyEntry();
        if (!(await keyEntry.has(hash)))
            return null;
        return (await keyEntry.get(hash));
    }
    async setChatKey(chatKey) {
        let keyEntry = await this.getKeyEntry();
        await keyEntry.set(this.transformTextToKey(chatKey.text), chatKey);
    }
    async getChatKeyHashConnectionRefCount(hash, connectionHash) {
        let keyEntry = await this.getKeyEntry();
        if (!(await keyEntry.has(hash)))
            return 0;
        let chatKeyEntry = await keyEntry.getEntry(hash);
        if (!chatKeyEntry)
            return 0;
        let connectionEntry = await chatKeyEntry.getEntry('connection');
        if (!connectionEntry)
            return 0;
        return (await connectionEntry.get(connectionHash));
    }
    async updateChatKeyConnectionRefCount(text, connectionHash, refCount) {
        return this.updateChatKeyHashConnectionRefCount(this.transformTextToKey(text), connectionHash, refCount);
    }
    async updateChatKeyHashConnectionRefCount(hash, connectionHash, refCount) {
        let keyEntry = await this.getKeyEntry();
        if (!(await keyEntry.has(hash)))
            return false;
        let chatKeyEntry = await keyEntry.getEntry(hash);
        let connectionEntry = await chatKeyEntry.getEntry('connection');
        return connectionEntry.set(connectionHash, refCount);
    }
    createNewChatKey(text) {
        return {
            'text': text,
            'connection': {}
        };
    }
}
exports.StudyManager = StudyManager;
//# sourceMappingURL=study-manager.js.map