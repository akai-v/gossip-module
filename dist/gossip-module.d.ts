/// <reference types="node" />
import { BotModule, DatabaseEntry, BotMessageEvent, UserMessage } from "@akaiv/core";
export declare class GossipModule extends BotModule {
    static readonly SORRY_FOR_THE_INCONVENIENCE: string;
    private studyManager;
    private lastMessageMap;
    private notifyMap;
    private urlRegex;
    sorryForTheInconvenienceImg: Buffer | null;
    constructor({ studyDB }: {
        studyDB: DatabaseEntry;
    });
    get Name(): string;
    get Description(): string;
    get Namespace(): string;
    protected loadModule(): Promise<void>;
    protected unloadModule(): Promise<void>;
    protected onMessage(e: BotMessageEvent): Promise<void>;
    protected processGossip(message: UserMessage, multiplier?: number): Promise<void>;
}
