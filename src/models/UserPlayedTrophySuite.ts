import {TrophySuite} from "./TrophySuite.js";

export interface UserPlayedTrophySuite {
    trophySuite: TrophySuite,
    playerId: string,
    lastPlayedAt: string,
}