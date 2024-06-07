export function base64ToBytes(base64) {
    const binString = atob(base64);
    return Uint8Array.from(binString, (m) => m.codePointAt(0));
    // return Base64.toUint8Array(base64); // both ways work, at least for small strings
}

export function bytesToBase64(bytes) {
    const binString = Array.from(bytes, (byte) =>
      String.fromCodePoint(byte),
    ).join("");
    return btoa(binString);
    // return Base64.fromUint8Array(bytes); // both ways work, at least for small strings
}
