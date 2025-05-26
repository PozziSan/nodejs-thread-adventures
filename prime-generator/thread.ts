import generatePrimes from './PrimeGenerator.ts';
import { workerData, parentPort } from 'worker_threads';

type WorkerDataType = {
    numberOfPrimeNumbers: number;
    start: number | bigint;
};

const { numberOfPrimeNumbers, start } = workerData as WorkerDataType;

const primes = generatePrimes(numberOfPrimeNumbers, start);

parentPort?.postMessage(primes);
