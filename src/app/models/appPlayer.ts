import {PsnUser} from "../../psn/models/psnUser.js";
import {computeUserUuid} from "../utils/uuid.js";

export interface AppPlayer {
    id: string,
    pseudo: string,
    avatar_url: string
}

export function buildAppPlayer(psnUserList: PsnUser[]): AppPlayer[] {
    return psnUserList.map(u => {
        return {
            id: computeUserUuid(u),
            pseudo: u.profileName,
            avatar_url: u.avatarUrl ?? ""
        };
    });
}