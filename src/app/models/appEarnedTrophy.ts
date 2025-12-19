import {PsnEarnedTrophy} from "../../psn/models/psnEarnedTrophy.js";
import {computeTrophyUuid, computeUserUuid} from "../utils/uuid.js";

export interface AppEarnedTrophy {
    player_id: string;
    trophy_id: string;
    earned_at: string;
}

export function buildAppEarnedTrophies(psnEarnedTrophyList: PsnEarnedTrophy[]): AppEarnedTrophy[] {
    return psnEarnedTrophyList.map(t => {
        return {
            player_id: computeUserUuid(t.userId),
            trophy_id: computeTrophyUuid(t.trophyId, t.trophyRank),
            earned_at: t.earnedDateTime,
        }
    });
}