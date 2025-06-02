import type Runnable from "../interfaces.ts";
import { type RandomNumberGenerationOptionsType } from "./random.ts";
import { performance } from 'perf_hooks';
import { Worker } from 'worker_threads'

export default class HeavyRandomOperationsApp implements Runnable {
    private readonly THREADS = 8;
    private readonly NUMBER_OF_RANDOM_NUMBERS = 100_000_000;
    private readonly NUMBER_OF_BATCHES = 4096;

    /**
     * RESULTS:
     * 
     * THREADS = 2, NUMBER_OF_RANDOM_NUMBER = 100_000, type: crypto: 1083.488459ms
     * THREADS = 2, NUMBER_OF_RANDOM_NUMBER = 100_000, type: math: 211.57924999999994ms
     * THREADS = 2, NUMBER_OF_RANDOM_NUMBER = 100_000, type: crypto-batch: 168.55712500000004ms
     * THREADS = 8, NUMBER_OF_RANDOM_NUMBER = 100_000, type: crypto: 7466.928208ms 
     * THREADS = 8, NUMBER_OF_RANDOM_NUMBER = 100_000, type: math: 388.75637499999993ms
     * THREADS = 8, NUMBER_OF_RANDOM_NUMBER = 100_000, type: crypto-bath: 529.6117919999999ms
     * THREADS = 8, NUMBER_OF_RANDOM_NUMBER = 100_000_000, type: crypto: I left this half an hour and it didn't finish so I gave up.
     * THREADS = 8, NUMBER_OF_RANDOM_NUMBER = 100_000_000, type: math: 1136.4889170000001ms
     * THREADS = 8, NUMBER_OF_RANDOM_NUMBER = 100_000_000, type: crypto-bath: 4698.959917ms
     */
    
    public run(): void {
        let completed = 0;
        let sum = 0;
        const start = performance.now();

        const options = {
            type: 'crypto-batch',
            numberOfRandomNumbers: this.NUMBER_OF_RANDOM_NUMBERS,
            batchSize: this.NUMBER_OF_BATCHES
        } satisfies RandomNumberGenerationOptionsType

        for (let t = 0; t < this.THREADS; t++) {
            const thread = new Worker('./heavy-random-operations/thread.ts', {workerData: options});
            const { threadId } = thread;
            console.log(`Thread: ${threadId} started!`);

            thread.on('error', (err) => {
                console.log(`Error caught on thread: ${threadId}: ${err}`);
                throw err;
            });

            thread.on('message', (result: number) => {
                sum += result;
            });

            thread.on('exit', (code: number) => {
                console.log(`Thread: ${threadId} exited with code: ${code}`);
                completed++;

                if (code !== 0) throw new Error(`Thread: ${threadId} exited with code ${code}`);
                
                if (completed === this.THREADS) {
                     console.log('Calculation Completed');
                     console.log(`Sum: ${sum}`);
                     console.log(`Time taken:  ${performance.now() - start}ms`);
                }
            });
        }
    }
}
