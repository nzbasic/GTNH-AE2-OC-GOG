import pako from 'pako';

export function compress(object: any) {
    const buffer = Buffer.from(JSON.stringify(object));
    const compressed = pako.deflate(buffer);
    let binaryString = "";
    for (let i = 0; i < compressed.length; i++) {
        binaryString += String.fromCharCode(compressed[i]);
    }
    return btoa(binaryString);
}

export function decompress(compressed: string) {
    const binaryString = atob(compressed);
    const compressedArray = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        compressedArray[i] = binaryString.charCodeAt(i);
    }
    const decompressed = pako.inflate(compressedArray);
    return JSON.parse(Buffer.from(decompressed).toString());
}
