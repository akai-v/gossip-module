import { DatabaseEntry, UserMessage, Channel } from "@akaiv/core";
export declare class StudyManager {
    private dbEntry;
    constructor(dbEntry: DatabaseEntry);
    canStudy(message: UserMessage): Promise<boolean>;
    canResponse(message: UserMessage): Promise<boolean>;
    getTotalMessage(): Promise<number>;
    setTotalMessage(count: number): Promise<void>;
    getKeyEntry(): Promise<DatabaseEntry>;
    getSettingsEntry(): Promise<DatabaseEntry>;
    getChannelResponseFlag(channel: Channel): Promise<boolean>;
    setChannelResponseFlag(channel: Channel, flag: boolean): Promise<boolean>;
    transformTextToKey(text: string): string;
    getChatKey(text: string): Promise<ChatKey | null>;
    getChatKeyByHash(hash: string): Promise<ChatKey | null>;
    setChatKey(chatKey: ChatKey): Promise<void>;
    getChatKeyHashConnectionRefCount(hash: string, connectionHash: string): Promise<number>;
    updateChatKeyConnectionRefCount(text: string, connectionHash: string, refCount: number): Promise<boolean>;
    updateChatKeyHashConnectionRefCount(hash: string, connectionHash: string, refCount: number): Promise<boolean>;
    createNewChatKey(text: string): ChatKey;
}
export declare type ChatConnection = {
    [key: string]: number;
};
export declare type ChatKey = {
    "text": string;
    "connection": ChatConnection;
};
