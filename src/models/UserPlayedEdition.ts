import {Edition} from "./Edition.js";

export interface UserPlayedEdition {
    edition: Edition,
    playerId: string,
    lastPlayedAt: string,
}