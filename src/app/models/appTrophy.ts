import {PsnTrophy} from "../../psn/models/psnTrophy.js";
import {computeGameUuid, computeTrophyUuid} from "../utils/uuid.js";

export interface AppTrophy {
    id: string;
    gameId: string;
    gameGroupId: string;
    rank: number;
    title: string;
    description: string;
    trophyType: string;
    isHidden: boolean;
    iconUrl: string;
}

export function buildAppTrophies(psnTrophyList: PsnTrophy[]): AppTrophy[] {
    return psnTrophyList.map(t => {
        return {
            id: computeTrophyUuid(t.id, t.rank),
            gameId: computeGameUuid(t.titleId),
            gameGroupId: t.groupId,
            rank: t.rank,
            title: t.title,
            description: t.detail,
            trophyType: t.trophyType,
            isHidden: t.isHidden,
            iconUrl: t.iconUrl,
        }
    });
}