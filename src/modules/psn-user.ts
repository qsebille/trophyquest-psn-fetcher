import {AuthData} from "./auth.js";

export type UserDTO = {
    id: string;
    profileName: string;
    avatarUrl: string | null;
}

export async function getUserInfo(auth: AuthData, profileName: string): Promise<UserDTO> {
    // @ts-ignore
    const {getProfileFromUserName} = await import("psn-api");
    const userPsn = await getProfileFromUserName(auth, profileName);
    return {
        id: userPsn.profile.accountId,
        profileName: userPsn.profile.onlineId,
        avatarUrl: userPsn.profile.avatarUrls[0]?.avatarUrl ?? null,
    };
}