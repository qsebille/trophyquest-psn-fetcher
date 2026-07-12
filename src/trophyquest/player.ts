import {Player} from "../psn/player/player.model";
import {computeTrophyQuestPlayerUuid} from "../utils/uuid";

export interface TrophyQuestPlayer {
    id: string
    pseudo: string
    psnAvatarUrl: string
}

export function buildTrophyQuestPlayer(players: Player[]) {
    return players.map(player => {
        const playerId = computeTrophyQuestPlayerUuid(player.id)
        return {
            id: playerId,
            pseudo: player.pseudo,
            psnAvatarUrl: player.avatarUrl,
        } as TrophyQuestPlayer
    })
}