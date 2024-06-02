const ae2Units = ['k', 'M', 'G', 'T', 'P', 'E']
const size = 1e3;

export function toAEUnit(number?: number | undefined) {
    if (number === undefined) return 'N/A';

    let unit = '';
    let value = number

    for (let i = 0; i < ae2Units.length; i++) {
        if (value < size) break;

        value /= size;
        unit = ae2Units[i];
    }

    if (unit) {
        return `${value.toFixed(2)}${unit}`;
    }

    return `${value}${unit}`;
}

const powerUnits = ['k', 'M', 'B', 'T', 'Q', 'P', 'E']
export function toPowerUnit(number?: number | string | undefined) {
    if (number === undefined) return 'N/A';

    let unit = '';
    let value = typeof number === 'string' ? parseFloat(number) : number;
    let negative = value < 0;
    value = Math.abs(value);

    for (let i = 0; i < powerUnits.length; i++) {
        if (value < size) break;

        value /= size;
        unit = powerUnits[i];
    }

    let output = '';
    if (negative) {
        output = '-';
    }

    if (unit) {
        output += `${value.toFixed(2)}${unit}`;
    } else {
        output += `${value}${unit}`;
    }

    return output;
}
