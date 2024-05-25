const units = ['k', 'M', 'G', 'T', 'P', 'E']
const size = 1e3;

export function toAEUnit(number?: number | undefined) {
    if (number === undefined) return 'N/A';

    let unit = '';
    let value = number;

    for (let i = 0; i < units.length; i++) {
        if (value < size) break;

        value /= size;
        unit = units[i];
    }

    if (unit) {
        return `${value.toFixed(2)}${unit}`;
    }

    return `${value}${unit}`;
}
