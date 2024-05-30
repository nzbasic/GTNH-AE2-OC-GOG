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
    cpus: CPU[]
    avgPowerInjection: number;
    storedPower: number;
    avgPowerUsage: number;
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
