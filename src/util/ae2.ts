export function formatName(name: string) {
    if (!name) return name;

    if (name.startsWith('drop of ')) {
        return name.slice(8);
    }

    return name;
}
