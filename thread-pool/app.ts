import type Runnable from '../interfaces.ts';
import Pool from './pool.ts';
import type { Task, TaskResults } from './types.ts';

export default class ThreadPoolRunnable implements Runnable {
    public async run() {
        const pool = new Pool(4);
        setTimeout(async () => await pool.destroy(), 1000 * 60);
        const promises: Promise<TaskResults>[] = [];

        for (let i = 0; i < 8000; i++) {
            const taskPrimes: Task = {
                taskName: 'primeNumbers',
                options: {
                    numberOfPrimeNumbers: i,
                    start: i * 1000,
                },
                resolve: () => {},
                reject: () => {},
            };
            const taskRandomSum: Task = {
                taskName: 'randomNumberSum',
                options: {
                    numberOfRandomNumbers: i * 1000,
                    type: 'crypto-batch',
                    batchSize: i * 1000,
                },
                resolve: () => {},
                reject: () => {},
            };

            promises.push(pool.run(taskPrimes));
            promises.push(pool.run(taskRandomSum));
        }

        const results = await Promise.all(promises);

        console.log('---------------------------');
        console.log('Finished all tasks!');
        console.log(results.length);

        await pool.destroy();
    }
}
