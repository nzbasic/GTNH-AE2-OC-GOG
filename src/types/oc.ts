export type Item = {
    [name: string]: number;
}

export type CPU = {
    pendingItems: Item[];
    name: string;
    busy: boolean;
    activeItems: Item[];
    storedItems: Item[];
    finalOutput: Item;
    storage: number;
}

export type OCStats = {
    network: {
        cpus: CPU[]
        avgPowerInjection: number;
        storedPower: number;
        avgPowerUsage: number;
    },
    lsc: {
        eu: string;
        euIn: number;
        euOut: number;
    },
    tps: {
        mspt: number;
        tps: number;
    }
}

export type OCItems = Item;

export type OCMachines = {
    machines: {
        [address: string]: {
            x: number;
            y: number;
            z: number;
            hasWork: boolean;
            time: number;
            active: boolean;
        }
    }[];
    names: {
        [address: string]: string;
    }
}

export type OCCraftables = Record<string, string>;
