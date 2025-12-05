import {PsnUser} from "../../../psn/models/psnUser.js";
import {computeUserUuid} from "../../utils/uuid.js";

export interface UserStaging {
    userPsnId: string;
    userAppId: string;
    profileName: string;
    avatarUrl: string;
}

export function buildUserProfileStaging(users: PsnUser[]): UserStaging[] {
    return users.map(user => ({
        userPsnId: user.id,
        userAppId: computeUserUuid(user.id),
        profileName: user.profileName,
        avatarUrl: user.avatarUrl ?? "",
    }));
}