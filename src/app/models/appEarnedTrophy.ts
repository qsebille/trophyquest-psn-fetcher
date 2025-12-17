import {PsnEarnedTrophy} from "../../psn/models/psnEarnedTrophy.js";
import {SchemaIdMap} from "./staging/schemaIdMap.js";

export interface AppEarnedTrophy {
    player_id: string;
    trophy_id: string;
    earned_at: string;
}

export function buildAppEarnedTrophies(
    PsnEarnedTrophyList: PsnEarnedTrophy[],
    schemaIdMap: SchemaIdMap,
): AppEarnedTrophy[] {
    const appUserTrophies: AppEarnedTrophy[] = [];
    const ids = new Set<String>();
    for (const psnEarnedTrophy of PsnEarnedTrophyList) {
        const userAppId = schemaIdMap.players.get(psnEarnedTrophy.userId);
        if (!userAppId) {
            console.error(`Build earned-trophies: Could not find user ${psnEarnedTrophy.userId} in schema-id-map.`);
            process.exit(1);
        }

        const trophyAppId = schemaIdMap.trophies.get(psnEarnedTrophy.trophyId);
        if (!trophyAppId) {
            console.error(`Build earned-trophies: Could not find trophy ${psnEarnedTrophy.trophyId} in schema-id-map.`);
            process.exit(1);
        }

        const id = `${userAppId}-${psnEarnedTrophy.trophyId}`;
        if (!ids.has(id)) {
            appUserTrophies.push({
                player_id: userAppId,
                trophy_id: trophyAppId,
                earned_at: psnEarnedTrophy.earnedDateTime,
            });
            ids.add(id);
        }
    }

    return appUserTrophies;
}