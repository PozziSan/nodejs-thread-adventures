import { Worker } from 'worker_threads';
import type Runnable from '../interfaces.ts';

import { performance } from 'perf_hooks';

export default class PrimeGeneratorApp implements Runnable {
    private readonly THREADS = 6;

    public run(): void {
        // This took around 32606.602208ms to run generatePrimes(200, 100_000_000_000_000) in a single thread
        // 2 Threads: 17145.33575ms
        // 4 Threads: 8952.622375ms
        // 6 Threads: 6496.056125ms

        const start = performance.now();
        const numberOfPrimeNumbers = 200;
        const resultPrimes: Array<number | bigint> = [];
        let completed = 0;

        for (let t = 0; t < this.THREADS; t++) {
            const thread = new Worker('./prime-generator/thread.ts', {
                workerData: { numberOfPrimeNumbers: numberOfPrimeNumbers / this.THREADS, start: 100_000_000_000_000 },
            });
            const { threadId } = thread;
            console.log(`Thread: ${threadId} started`);

            thread.on('message', (primes: Array<number | bigint>) => {
                console.log(`Received results from thread: ${threadId}`);
                resultPrimes.push(...primes);
            });

            thread.on('error', (error) => {
                console.log(error);
                throw error;
            });

            thread.on('exit', (code) => {
                console.log(`Thread ${threadId} exited with code ${code}`);
                completed++;

                if (completed === this.THREADS) {
                    console.log('----------------------------------');
                    console.log(`Prime number generation finished. Time taken: ${performance.now() - start}ms`);
                    console.log(resultPrimes.sort());
                }
            });
        }
    }
}
