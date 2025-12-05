import {PsnEarnedTrophy} from "../../psn/models/psnEarnedTrophy.js";
import {UserStaging} from "./staging/userStaging.js";
import {TrophyStaging} from "./staging/trophyStaging.js";

export interface AppEarnedTrophy {
    player_id: string;
    trophy_id: string;
    earned_at: string;
}

export function buildAppEarnedTrophies(
    psnUserEarnedTrophies: PsnEarnedTrophy[],
    userStaging: UserStaging[],
    trophyStaging: TrophyStaging[],
): AppEarnedTrophy[] {
    const userStagingById = new Map<string, UserStaging>(userStaging.map(u => [u.userPsnId, u]));
    const trophyStagingByPsnId = new Map<string, TrophyStaging>(trophyStaging.map(t => [t.trophyPsnId, t]));

    const appUserTrophies: AppEarnedTrophy[] = [];
    const ids = new Set<String>();
    for (const psnEarnedTrophy of psnUserEarnedTrophies) {
        const user = userStagingById.get(psnEarnedTrophy.userId);
        const trophy = trophyStagingByPsnId.get(psnEarnedTrophy.trophyId);
        if (!user || !trophy) {
            continue;
        }

        const id = `${user.userAppId}-${trophy.trophyPsnId}`;
        if (!ids.has(id)) {
            appUserTrophies.push({
                player_id: user.userAppId,
                trophy_id: trophy.trophyAppUuid,
                earned_at: psnEarnedTrophy.earnedDateTime,
            });
            ids.add(id);
        }
    }

    return appUserTrophies;
}