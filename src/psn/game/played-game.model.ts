import {GameImage} from "./game-image.model";

export interface PlayedGame {
    conceptId: number
    titleIds: string[]
    name: string
    imageUrl: string
    lastPlayedAt: string
    images: GameImage[]
}