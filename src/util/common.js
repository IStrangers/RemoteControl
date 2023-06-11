import pako from "pako";

export const throttle = (func, delay) => {
    let timeoutId;
    let lastExecTime = 0;

    return function (...args) {
        const currentTime = Date.now();
        const remainingTime = delay - (currentTime - lastExecTime);

        clearTimeout(timeoutId);

        if (remainingTime <= 0) {
            func.apply(this, args);
            lastExecTime = currentTime;
        } else {
            timeoutId = setTimeout(() => {
                func.apply(this, args);
                lastExecTime = Date.now();
            }, remainingTime);
        }
    };
}

export const decompressBlob = (blob, callback) => {
    const fileReader = new FileReader();
    fileReader.onload = function() {
        const compressedData = new Uint8Array(fileReader.result);
        const uncompressedData = pako.inflate(compressedData);
        callback(null, uncompressedData);
    };
    fileReader.onerror = function() {
        callback(new Error('Failed to read the file.'));
    };
    fileReader.readAsArrayBuffer(blob);
}