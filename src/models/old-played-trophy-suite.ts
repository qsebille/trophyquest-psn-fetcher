import {TrophySuite} from "./trophy-suite.js";

export interface OldPlayedTrophySuite {
    trophySuite: TrophySuite,
    playerId: string,
    lastPlayedAt: string,
}