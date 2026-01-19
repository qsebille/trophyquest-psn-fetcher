import {GameImage} from "./GameImage.js";

export interface Game {
    id: number,
    name: string,
    images: GameImage[],
    psnTitleIds: string[],
}