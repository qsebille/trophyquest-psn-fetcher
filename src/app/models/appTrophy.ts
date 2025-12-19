import {PsnTrophy} from "../../psn/models/psnTrophy.js";
import {computeGameUuid, computeTrophyUuid} from "../utils/uuid.js";

export interface AppTrophy {
    id: string;
    game_id: string;
    game_group_id: string;
    rank: number;
    title: string;
    description: string;
    trophy_type: string;
    is_hidden: boolean;
    icon_url: string;
}

export function buildAppTrophies(psnTrophyList: PsnTrophy[]): AppTrophy[] {
    return psnTrophyList.map(t => {
        return {
            id: computeTrophyUuid(t.id, t.rank),
            game_id: computeGameUuid(t.titleId),
            game_group_id: t.groupId,
            rank: t.rank,
            title: t.title,
            description: t.detail,
            trophy_type: t.trophyType,
            is_hidden: t.isHidden,
            icon_url: t.iconUrl,
        }
    });
}