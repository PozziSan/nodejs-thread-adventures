import type Runnable from '../interfaces.ts';
import Pool from './pool.ts';
import type { GenericTask, Task, TaskResults } from './types.ts';
import { setImmediate } from 'timers/promises';

export default class ThreadPoolRunnable implements Runnable {
    protected pool: Pool;
    protected readonly timeout: NodeJS.Timeout;
    protected readonly bachSize: number;
    protected readonly totalTasks: number;
    protected resultCount: number;

    public constructor() {
        this.pool = new Pool(4);
        this.timeout = setTimeout(async () => await this.pool.destroy(), 1000 * 600);
        this.bachSize = 400;
        this.totalTasks = 5_000;
        this.resultCount = 0;
    }

    protected async processBatch(
        startIndex: number,
        endIndex: number,
        batchIndex: number,
        resultCb: GenericTask['resolve'] = () => {},
        rejectCb: GenericTask['reject'] = () => {}
    ) {
        console.log('--------------------');
        console.log(`Starting Batch: ${batchIndex}`);

        const promises: Promise<TaskResults>[] = [];

        for (let i = startIndex; i < endIndex; i++) {
            const taskPrimes: Task = {
                taskName: 'primeNumbers',
                options: {
                    numberOfPrimeNumbers: 10_000,
                    start: i,
                },
                resolve: resultCb,
                reject: rejectCb,
            };
            const taskRandomSum: Task = {
                taskName: 'randomNumberSum',
                options: {
                    numberOfRandomNumbers: 10_000,
                    type: 'crypto-batch',
                    batchSize: this.bachSize * 2,
                },
                resolve: resultCb,
                reject: rejectCb,
            };

            promises.push(this.pool.run(taskPrimes));
            promises.push(this.pool.run(taskRandomSum));
        }

        const results = await Promise.all(promises);
        this.resultCount += results.length;

        console.log('--------------------');
        console.log(`Finished Batch: ${batchIndex}`);
    }

    public async run() {
        this.pool.start();

        for (let batchIndex = 0; batchIndex < Math.ceil(this.totalTasks / this.bachSize); batchIndex++) {
            const startIndex = batchIndex * this.bachSize;
            const endIndex = Math.min((batchIndex + 1) * this.bachSize, this.totalTasks);

            await this.processBatch(startIndex, endIndex, batchIndex);

            // At every 10 batches set a new tick on the event loop to prevent the event loop from blocking and give GC opportunity to run
            if (batchIndex % 10 === 0) {
                console.log('--------------------');
                console.log('Breathing...');
                await setImmediate();
            }
        }

        console.log('---------------------------');
        console.log('Finished all tasks!');
        console.log(this.resultCount);

        clearTimeout(this.timeout);
        await this.pool.destroy();
    }
}
