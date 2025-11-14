import type Runnable from '../interfaces.ts';
import { Worker } from 'worker_threads';

export default class SemaphoreRunnable implements Runnable {
    private readonly threadNumbers: number;
    private threads: Worker[];
    private readonly number: Uint32Array<SharedArrayBuffer>;
    private readonly seal: SharedArrayBuffer;

    public constructor() {
        this.threadNumbers = 20;
        this.threads = [];

        // 32-bit numbers.
        this.number = new Uint32Array(new SharedArrayBuffer(4));
        this.seal = new SharedArrayBuffer(4);
    }

    private async stopThreads() {
        console.log('Terminating Threads!');
        await Promise.all(this.threads.map((worker) => worker.terminate()));
        process.exit(1);
    }

    public async run() {
        console.log('Starting Threads!');
        let completed = 0;

        for (let i = 0; i < this.threadNumbers; i++) {
            const worker = new Worker('./semaphore/thread.ts', {
                workerData: { number: this.number.buffer, seal: this.seal },
            });

            this.threads.push(worker);

            worker.on('exit', async () => {
                completed++;

                if (completed === this.threadNumbers) {
                    console.log('Final number is: ', this.number[0]);
                    await this.stopThreads();
                }
            });
        }
    }
}
