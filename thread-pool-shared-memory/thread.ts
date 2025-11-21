import { workerData, parentPort } from 'worker_threads';
import type { GenericWorkerTask, TaskMap, TaskResults, WorkerTask } from '../thread-pool/types.ts';
import generatePrimes from '../prime-generator/PrimeGenerator.ts';
import { generateSumOfRandomNumbers } from '../heavy-random-operations/random.ts';

type WorkerData = {
    numbers: SharedArrayBuffer;
    numbersSeal: SharedArrayBuffer;
    primes: SharedArrayBuffer;
    primesSeal: SharedArrayBuffer;
};

const data = workerData as WorkerData;
const primes = new BigUint64Array(data.primes);
const primesSeal = new Int32Array(data.primesSeal);
const numbers = new BigInt64Array(data.numbers);
const numbersSeal = new Int32Array(data.numbersSeal);

const lock = (seal: Int32Array) => {
    while (Atomics.compareExchange(seal, 0, 0, 1) !== 0) {
        Atomics.wait(seal, 0, 1);
    }
};

const unlock = (seal: Int32Array) => {
    Atomics.store(seal, 0, 0);
    Atomics.notify(seal, 0, 20);
};

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
            result = result.map((n): bigint => {
                return typeof n === 'number' ? BigInt(n) : n;
            });

            lock(primesSeal);
            primes.set(result as bigint[], primes.indexOf(0n));
            unlock(primesSeal);

            break;
        case 'randomNumberSum':
            result = processRandomNumberSumTask(task);

            lock(numbersSeal);
            numbers.set([BigInt(result)], numbers.indexOf(0n));
            unlock(numbersSeal);

            break;
        default:
            throw new Error('Unknown Task');
    }

    parentPort?.postMessage(result);
});
