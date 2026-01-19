import {fetchUserPlayedTitles} from "./fetchPlayedTitles.js";
import {AuthorizationPayload} from "psn-api";
import {UserPlayedGame} from "../../models/UserPlayedGame.js";
import {UserPlayedEdition} from "../../models/UserPlayedEdition.js";
import {Player} from "../../models/Player.js";

export type UserGamesEditionsData = {
    games: UserPlayedGame[];
    editions: UserPlayedEdition[];
}

export async function fetchUserGamesAndEditions(
    auth: AuthorizationPayload,
    player: Player,
): Promise<UserGamesEditionsData> {
    const startTime = Date.now();
    const accountId = player.id;
    const playedTitles = await fetchUserPlayedTitles(auth, accountId);

    const gameMap = new Map<number, UserPlayedGame>();
    const editions: UserPlayedEdition[] = [];
    playedTitles
        .forEach(playedTitle => {
            // Games
            const gameId = playedTitle.concept.id;
            if (gameMap.has(gameId)) {
                const existingGame = gameMap.get(gameId)!;
                const firstPlayedAt = new Date(existingGame.firstPlayedAt) < new Date(playedTitle.firstPlayedDateTime) ? existingGame.firstPlayedAt : playedTitle.firstPlayedDateTime;
                const lastPlayedAt = new Date(existingGame.lastPlayedAt) > new Date(playedTitle.lastPlayedDateTime) ? existingGame.lastPlayedAt : playedTitle.lastPlayedDateTime;
                gameMap.set(gameId, {
                    ...existingGame,
                    firstPlayedAt,
                    lastPlayedAt,
                });
            } else {
                gameMap.set(gameId, {
                    game: {
                        id: gameId,
                        name: playedTitle.concept.name,
                        images: playedTitle.concept.media.images,
                        psnTitleIds: playedTitle.concept.titleIds
                    },
                    playerId: player.id,
                    firstPlayedAt: playedTitle.firstPlayedDateTime,
                    lastPlayedAt: playedTitle.lastPlayedDateTime,
                });
            }

            // Edition (= title)
            editions.push({
                edition: {
                    gameId: playedTitle.concept.id,
                    id: playedTitle.titleId,
                    name: playedTitle.name,
                    imageUrl: playedTitle.imageUrl,
                    category: playedTitle.category,
                    service: playedTitle.service,
                },
                playerId: player.id,
                lastPlayedAt: playedTitle.lastPlayedDateTime,
            });
        });

    const duration = (Date.now() - startTime) / 1000;
    console.info(`Fetched ${gameMap.size} games and ${editions.length} editions in ${duration.toFixed(2)} s`);

    return {
        games: [...gameMap.values()],
        editions: editions,
    };
}