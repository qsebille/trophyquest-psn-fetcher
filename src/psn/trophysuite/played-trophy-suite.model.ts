export interface PlayedTrophySuite {
    id: string
    gameId: number | null
    name: string
    iconUrl: string
    platforms: string[]
    hasTrophyGroups: boolean
    npServiceName: "trophy" | "trophy2"
    lastPlayedAt: string
}