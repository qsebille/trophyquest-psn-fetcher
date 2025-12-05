import {UserStaging} from "./staging/userStaging.js";

export interface AppPlayer {
    id: string,
    pseudo: string,
    avatar_url: string
}

export function buildAppPlayer(userProfileStaging: UserStaging[]): AppPlayer[] {
    return userProfileStaging.map(u => {
        return {
            id: u.userAppId,
            pseudo: u.profileName,
            avatar_url: u.avatarUrl ?? ""
        };
    });
}