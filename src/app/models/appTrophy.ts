import {TrophyStaging} from "./staging/trophyStaging.js";

export interface AppTrophy {
    id: string;
    trophy_collection_id: string;
    game_group_id: string;
    rank: number;
    title: string;
    description: string;
    trophy_type: string;
    is_hidden: boolean;
    icon_url: string;
}

export function buildAppTrophies(trophyStaging: TrophyStaging[]): AppTrophy[] {
    return trophyStaging.map(t => {
        return {
            id: t.trophyAppUuid,
            trophy_collection_id: t.trophyCollectionAppUuid,
            game_group_id: t.gameGroupId,
            rank: t.rank,
            title: t.title,
            description: t.detail,
            trophy_type: t.trophyType,
            is_hidden: t.isHidden,
            icon_url: t.iconUrl,
        }
    });
}