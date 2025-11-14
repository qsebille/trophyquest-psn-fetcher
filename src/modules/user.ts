import {userUuid} from "./uuid.js";
import {Auth} from "./auth.js";

export type UserTQ = {
    id: string;
    profileName: string;
    avatarUrl: string | null;
}

export async function getUserInfo(auth: Auth): Promise<UserTQ> {
    // @ts-ignore
    const {getProfileFromUserName} = await import("psn-api");
    const userPsn = await getProfileFromUserName(auth, "me");
    return {
        id: userUuid(userPsn.profile.accountId),
        profileName: userPsn.profile.onlineId,
        avatarUrl: userPsn.profile.avatarUrls[0]?.avatarUrl ?? null,
    };
}