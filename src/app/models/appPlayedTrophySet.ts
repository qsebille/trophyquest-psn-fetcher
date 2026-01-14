import {PsnPlayedTitle} from "../../psn/models/psnPlayedTitle.js";
import {computeTrophySetUuid, computeUserUuid} from "../utils/uuid.js";

export interface AppPlayedTrophySet {
    playerId: string;
    trophySetId: string;
    lastPlayedAt: string;
}

export function buildAppPlayedTrophySets(psnPlayedTitleList: PsnPlayedTitle[]): AppPlayedTrophySet[] {
    return psnPlayedTitleList.map(t => {
        return {
            playerId: computeUserUuid(t.userId),
            trophySetId: computeTrophySetUuid(t.titleId),
            lastPlayedAt: t.lastPlayedDateTime
        }
    });
}