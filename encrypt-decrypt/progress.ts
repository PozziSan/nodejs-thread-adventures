import { Transform, type TransformCallback } from 'stream';

type Operation = 'encrypted' | 'decrypted';

export default class ProgressStream extends Transform {
    private readonly operation: Operation;
    private readonly totalBytes: number;
    private bytesProcessed: number;
    private lastReportedPercentage: number;
    private readonly updateInterval: number;

    public constructor(operation: Operation, totalBytes: number, updateInterval?: number) {
        super();

        this.operation = operation;
        this.totalBytes = totalBytes;
        this.bytesProcessed = 0;
        this.lastReportedPercentage = 0;
        this.updateInterval = updateInterval ?? 10;
    }

    private reportPercentage(percentage: number) {
        console.log(`${percentage}% ${this.operation}`);
        this.lastReportedPercentage = percentage;
    }

    public override _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback): void {
        this.bytesProcessed += chunk.length;

        const currentPercentage = Math.floor((this.bytesProcessed / this.totalBytes) * 100);

        if (currentPercentage >= this.lastReportedPercentage + this.updateInterval) {
            const percentageToReport = Math.floor(currentPercentage / this.updateInterval) * this.updateInterval;

            if (percentageToReport > this.lastReportedPercentage) {
                this.reportPercentage(percentageToReport);
            }
        }

        if (this.bytesProcessed >= this.totalBytes && this.lastReportedPercentage < 100) this.reportPercentage(100);

        callback(null, chunk);
    }
}
