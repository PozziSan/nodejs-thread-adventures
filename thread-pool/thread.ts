import { parentPort } from 'worker_threads';
import generatePrimes from '../prime-generator/PrimeGenerator.ts';
import { generateSumOfRandomNumbers } from '../heavy-random-operations/random.ts';
import type { WorkerTask, TaskResults, TaskMap, GenericWorkerTask } from './types.ts';

const processPrimeNumberTask = (task: GenericWorkerTask<'primeNumbers'>): TaskMap['primeNumbers']['result'] => {
    const { numberOfPrimeNumbers, start } = task.options;

    return generatePrimes(numberOfPrimeNumbers, start) as Array<number | bigint>;
};

const processRandomNumberSumTask = (task: GenericWorkerTask<'randomNumberSum'>): TaskMap['randomNumberSum']['result'] =>
    generateSumOfRandomNumbers(task.options);

parentPort?.on('message', (task: WorkerTask) => {
    let result: TaskResults;
    
    switch (task.taskName) {
        case 'primeNumbers':
            result = processPrimeNumberTask(task);
            break;
        case 'randomNumberSum':
            result = processRandomNumberSumTask(task);
            break;
        default:
            throw new Error('Unknown Task');
    }

    parentPort?.postMessage(result);
});
