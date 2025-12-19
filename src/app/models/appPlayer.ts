import {PsnUser} from "../../psn/models/psnUser.js";
import {computeUserUuid} from "../utils/uuid.js";

export interface AppPlayer {
    id: string,
    pseudo: string,
    avatar_url: string
}

export function buildAppPlayers(psnUserList: PsnUser[]): AppPlayer[] {
    return psnUserList.map(u => {
        return {
            id: computeUserUuid(u.id),
            pseudo: u.profileName,
            avatar_url: u.avatarUrl ?? ""
        };
    });
}