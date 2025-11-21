import type { Direction } from 'readline';
import type Runnable from '../interfaces.ts';
import ThreadPoolRunnable from '../thread-pool/app.ts';
import SharedMemoryPool from './pool.ts';
import type { TaskResults } from '../thread-pool/types.ts';
import { performance } from 'perf_hooks';
import { setImmediate } from 'timers/promises';

export default class ThreadPoolSharedMemoryRunnable extends ThreadPoolRunnable implements Runnable {
    private tasksDone: number;
    protected override pool: SharedMemoryPool;

    public constructor() {
        super();
        this.pool = new SharedMemoryPool(4, this.totalTasks * 1000 * 80);
        this.tasksDone = 0;
    }

    private clearLine(dir: Direction): Promise<void> {
        return new Promise<void>((resolve, _) => process.stdout.clearLine(dir, () => resolve()));
    }

    private moveCursor(dx: Direction, dy: Direction): Promise<void> {
        return new Promise<void>((resolve, _) => process.stdout.moveCursor(dx, dy, () => resolve()));
    }

    public override async run(): Promise<void> {
        this.pool.start();
        const start = performance.now();

        const resultCb = async (_: TaskResults) => {
            if (this.tasksDone % 100 === 0) {
                await this.moveCursor(0, -1);
                await this.clearLine(0);
                await this.moveCursor(0, -1);
                await this.clearLine(0);

                console.log(`Event Loop Utilization: ${performance.eventLoopUtilization().utilization}`);
                console.log(`Tasks Done: ${Math.round(((this.tasksDone / 2) / this.totalTasks) * 100)}%...`);
            }

            this.tasksDone++;
        };

        for (let batchIndex = 0; batchIndex < Math.ceil(this.totalTasks / this.bachSize); batchIndex++) {
            const startIndex = batchIndex * this.bachSize;
            const endIndex = Math.min((batchIndex + 1) * this.bachSize, this.totalTasks);

            await this.processBatch(startIndex, endIndex, batchIndex, resultCb);

            console.log('Tasks Completed: ', this.tasksDone);
        }

        console.log('---------------------------');
        console.log('Finished all tasks!');
        console.log(`Time Taken: ${performance.now() - start}ms`);
        console.log('Result Count: ', this.resultCount);
        console.log('Primes: ', this.pool.getPrimes());
        console.log('Numbers: ', this.pool.getNumbers());
        console.log('---------------------------');

        clearTimeout(this.timeout);
        await this.pool.destroy();
        process.exit(0);
    }
}
