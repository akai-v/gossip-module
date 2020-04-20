import { BotModule, DatabaseEntry, BotMessageEvent, UserMessage } from "@akaiv/core";
export declare class GossipModule extends BotModule {
    private studyManager;
    private lastMessageMap;
    constructor({ studyDB }: {
        studyDB: DatabaseEntry;
    });
    get Name(): string;
    get Description(): string;
    get Namespace(): string;
    protected loadModule(): Promise<void>;
    protected unloadModule(): Promise<void>;
    protected onMessage(e: BotMessageEvent): Promise<void>;
    protected processGossip(message: UserMessage, processClient?: boolean, multiplier?: number): Promise<void>;
}
