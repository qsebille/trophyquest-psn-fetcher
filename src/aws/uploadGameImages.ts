import {mapWithConcurrency} from "./utils/mapWithConcurrency.js";
import {uploadImageFromUrl} from "./utils/uploadImageFromUrl.js";
import {GameImageData} from "../postgres/queries/images/gameMissingImages.js";

export async function uploadGameImages(
    missingGameImages: GameImageData[],
    concurrency: number
): Promise<GameImageData[]> {
    const staging = await mapWithConcurrency(missingGameImages, concurrency, async (data) => {
            if (!data.image_url) {
                return data;
            }

            const awsUrl = await uploadImageFromUrl(data.image_url, "games", data.id);
            return {...data, aws_image_url: awsUrl};
        }
    );

    return staging.filter(data => data.aws_image_url !== null);
}