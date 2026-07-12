export function buildTrophyId(trophySuiteId: string, rank: number,) {
    return `${trophySuiteId}:${rank}`;
}