import {PsnEarnedTrophy} from "../../psn/models/psnEarnedTrophy.js";
import {computeTrophyUuid, computeUserUuid} from "../utils/uuid.js";

export interface AppEarnedTrophy {
    playerId: string;
    trophyId: string;
    earnedAt: string;
}

export function buildAppEarnedTrophies(psnEarnedTrophyList: PsnEarnedTrophy[]): AppEarnedTrophy[] {
    return psnEarnedTrophyList.map(t => {
        return {
            playerId: computeUserUuid(t.userId),
            trophyId: computeTrophyUuid(t.trophyId, t.trophyRank),
            earnedAt: t.earnedDateTime,
        }
    });
}