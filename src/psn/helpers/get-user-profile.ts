import {AuthorizationPayload} from "psn-api";
import {Player} from "../../models/player.js";

export async function getUserProfile(
    auth: AuthorizationPayload,
    profileName: string
): Promise<Player> {
    const {getProfileFromUserName} = await import("psn-api");

    const userPsn = await getProfileFromUserName(auth, profileName);
    return {
        id: userPsn.profile.accountId,
        pseudo: userPsn.profile.onlineId,
        avatarUrl: userPsn.profile.avatarUrls[0]?.avatarUrl ?? null
    } as Player;
}