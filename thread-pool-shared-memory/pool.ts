import { Worker, workerData } from 'worker_threads';
import Pool from '../thread-pool/pool.ts';
import type { PoolWorker, TaskResults } from '../thread-pool/types.ts';

export default class SharedMemoryPool extends Pool {
    private readonly primes: SharedArrayBuffer;
    private readonly primesSeal: SharedArrayBuffer;
    private readonly numbers: SharedArrayBuffer;
    private readonly numbersSeal: SharedArrayBuffer;

    public constructor(threadNumber: number, totalItemsCount: number, debug: boolean = false) {
        super(threadNumber, debug);

        this.primes = new SharedArrayBuffer((totalItemsCount * 64) / 8);
        this.primesSeal = new SharedArrayBuffer(4);
        this.numbers = new SharedArrayBuffer((totalItemsCount * 64) / 8);
        this.numbersSeal = new SharedArrayBuffer(8);
    }

    protected override spawnThread(): void {
        const thread = new Worker('./thread-pool-shared-memory/thread.ts', {
            workerData: {
                numbers: this.numbers,
                numbersSeal: this.numbersSeal,
                primes: this.primes,
                primesSeal: this.primesSeal,
            },
        }) as PoolWorker;
        if (this.debug) console.log(`Spawned Thread ${thread.threadId}`);

        thread.on('message', async (result: TaskResults) => await this.handleResult(thread, result));
        thread.on('error', async (reason) => await this.handleError(thread, reason));

        this.threads.push(thread);
        this.idleThreads.push(thread);
    }

    /** Retrieves sorted prime numbers from shared memory, filtering out unused slots. */
    public getPrimes(): bigint[] {
        const typedArray = new BigUint64Array(this.primes);
        const result: bigint[] = [];
        for (let i = 0; i < typedArray.length; i++) {
            if (typedArray[i] !== 0n) {
                result.push(typedArray[i]);
            }
        }
        return result.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    }

    /** Retrieves sorted numbers from shared memory, filtering out unused slots. */
    public getNumbers(): bigint[] {
        const typedArray = new BigInt64Array(this.numbers);
        const result: bigint[] = [];
        for (let i = 0; i < typedArray.length; i++) {
            if (typedArray[i] !== 0n) {
                result.push(typedArray[i]);
            }
        }
        return result.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    }
}
