// app/callagents/[agentid]/_components/audioUtils.js

function createWavHeader(dataLength, options) {
    const { numChannels, sampleRate, bitsPerSample } = options;

    const byteRate = sampleRate * numChannels * bitsPerSample / 8;
    const blockAlign = numChannels * bitsPerSample / 8;
    const buffer = new ArrayBuffer(44); 
    const view = new DataView(buffer);

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);

    return buffer;
}

function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

function parseMimeType(mimeType) {
    const [fileType, ...params] = mimeType.split(';').map(s => s.trim());
    const [_, format] = fileType.split('/');

    const options = {
        numChannels: 1, 
        bitsPerSample: 16, 
        sampleRate: 24000, // Gemini Native Default
    };

    for (const param of params) {
        const [key, value] = param.split('=').map(s => s.trim());
        if (key === 'rate') {
            options.sampleRate = parseInt(value, 10);
        }
    }
    return options;
}

export function convertToWav(rawDataBase64Chunks, mimeType = "audio/pcm;rate=24000") {
    if (!rawDataBase64Chunks || rawDataBase64Chunks.length === 0) {
        return new ArrayBuffer(0);
    }

    const options = parseMimeType(mimeType);

    const dataBuffers = rawDataBase64Chunks.map(base64 => Uint8Array.from(atob(base64), c => c.charCodeAt(0)));
    const totalDataLength = dataBuffers.reduce((sum, buffer) => sum + buffer.length, 0);

    const rawAudioData = new Uint8Array(totalDataLength);
    let offset = 0;
    for (const buffer of dataBuffers) {
        rawAudioData.set(buffer, offset);
        offset += buffer.length;
    }

    const wavHeader = createWavHeader(totalDataLength, options);
    const combinedBuffer = new Uint8Array(wavHeader.byteLength + rawAudioData.byteLength);
    combinedBuffer.set(new Uint8Array(wavHeader), 0);
    combinedBuffer.set(rawAudioData, wavHeader.byteLength);

    return combinedBuffer.buffer;
}