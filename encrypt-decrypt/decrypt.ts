import { Transform, type TransformCallback } from 'stream';

export default class DecryptStream extends Transform {
    public override _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback): void {
        for (let i = 0; i < chunk.length; ++i) {
            if (chunk[i] !== 255) chunk[i] = chunk[i] - 1;
        }

        callback(null, chunk);
    }
}
