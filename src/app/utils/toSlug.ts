export function toSlug(input: string | null) {
    if (input == null) {
        return null;
    }

    return input
        // 1) Décomposer les accents
        .normalize('NFD')
        // 2) Supprimer les marques diacritiques (accents)
        .replace(/[\u0300-\u036f]/g, '')
        // 3) Garder uniquement lettres, chiffres et espaces
        .replace(/[^A-Za-z0-9\s]/g, '')
        // 4) Trim
        .trim()
        // 5) Remplacer les espaces (et blancs multiples) par "_"
        .replace(/\s+/g, '_')
        // 6) Minuscule
        .toLowerCase();
}