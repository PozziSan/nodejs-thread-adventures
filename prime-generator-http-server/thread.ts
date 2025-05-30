import { Worker, workerData, parentPort } from 'worker_threads';
import generatePrimes from '../prime-generator/PrimeGenerator.ts';

type WorkerDataType = {
    startNumber: number;
    quantity: number;
};

const { startNumber, quantity } = workerData as WorkerDataType;
const primeNumbers = generatePrimes(quantity, startNumber);

parentPort?.postMessage(primeNumbers);
