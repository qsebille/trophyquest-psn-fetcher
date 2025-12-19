import {PutObjectCommand, S3Client} from "@aws-sdk/client-s3";


export async function uploadImageFromUrl(
    imageUrl: string,
    folder: "players" | "games" | "trophies",
    fileName: string
): Promise<string | null> {
    if (!process.env.LAMBDA_TASK_ROOT) {
        console.warn("Running locally, skipping image upload.")
        return null;
    }

    const region = process.env.AWS_REGION ?? "eu-west-3";
    const s3 = new S3Client({region});
    const bucketName = process.env.IMAGES_BUCKET!;

    const res = await fetch(imageUrl);
    if (!res.ok) {
        console.error(`Failed to download image ${imageUrl}: ${res.status} ${res.statusText}`);
        return null;
    }

    const body = Buffer.from(await res.arrayBuffer());
    await s3.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: `${folder}/${encodeURIComponent(fileName)}.png`,
        Body: body,
        ContentType: "image/png",
    }));

    return `https://${bucketName}.s3.${region}.amazonaws.com/${folder}/${encodeURIComponent(fileName)}.png`;
}

