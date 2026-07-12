import {Edition} from "./edition.js";

export interface OldPlayedEdition {
    edition: Edition,
    playerId: string,
    lastPlayedAt: string,
}