import { type RandomNumberGenerationOptionsType, generateSumOfRandomNumbers } from './random.ts';
import { workerData, parentPort } from 'worker_threads';

const options = workerData as RandomNumberGenerationOptionsType;
const sum = generateSumOfRandomNumbers(options);

parentPort?.postMessage(sum);
