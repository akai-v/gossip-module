import { CommandInfo, BotCommandEvent, ModuleLogger } from "@akaiv/core";
import { StudyManager } from "./study-manager";
export declare class ToggleCommand implements CommandInfo {
    private studyManager;
    constructor(studyManager: StudyManager);
    get CommandList(): string[];
    get Usage(): string;
    get Description(): string;
    onCommand(e: BotCommandEvent, logger: ModuleLogger): Promise<void>;
}
export declare class InfoCommand implements CommandInfo {
    private studyManager;
    constructor(studyManager: StudyManager);
    get CommandList(): string[];
    get Usage(): string;
    get Description(): string;
    onCommand(e: BotCommandEvent, logger: ModuleLogger): Promise<void>;
}
