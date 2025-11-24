/**
 * Normalizes a PlayStation platform string by determining whether it represents a single, specific platform.
 * If the input contains only one platform among "PS5", "PS4", or "PS3", it returns that platform.
 * Otherwise, it returns the original input.
 *
 * @param {string} psnPlatform - A comma-separated string representing one or more PlayStation platforms.
 * @return {string} The normalized platform string if a single platform is identified, or the original input string.
 */
export function normalizePsnPlatform(psnPlatform: string): string {
    const allPlatforms: string[] = psnPlatform.split(",");
    if (allPlatforms.filter(p => p === "PS5").length === 1) {
        return "PS5";
    } else if (allPlatforms.filter(p => p === "PS4").length === 1) {
        return "PS4";
    } else if (allPlatforms.filter(p => p === "PS3").length === 1) {
        return "PS3"
    } else {
        return psnPlatform;
    }
}