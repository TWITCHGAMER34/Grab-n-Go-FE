// File: src/utils/image.ts
export function bufferLikeToDataUrl(img: any, defaultType = 'image/png'): string | undefined {
    if (!img) return undefined;

    // already a data URL or external URL
    if (typeof img === 'string') {
        if (img.startsWith('data:') || img.startsWith('http')) return img;
        // assume plain base64 string
        return `data:${defaultType};base64,${img}`;
    }

    // handle common serialized Node Buffer shapes:
    // { type: 'Buffer', data: [...] } or { data: [...] }
    const dataArray =
        Array.isArray(img.data) ? img.data :
            Array.isArray(img?.data?.data) ? img.data.data :
                undefined;

    if (!dataArray || !Array.isArray(dataArray) || dataArray.length === 0) return undefined;

    const uint8 = new Uint8Array(dataArray);

    // build binary string in chunks to avoid stack/arg limits
    let binary = '';
    const chunkSize = 0x8000; // 32KB
    for (let i = 0; i < uint8.length; i += chunkSize) {
        const sub = uint8.subarray(i, i + chunkSize);
        binary += String.fromCharCode(...sub);
    }

    const base64 = btoa(binary);
    const contentType = (typeof img.contentType === 'string' && img.contentType) ||
        (typeof img.mimetype === 'string' && img.mimetype) ||
        defaultType;

    return `data:${contentType};base64,${base64}`;
}
