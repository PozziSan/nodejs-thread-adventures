import type { Worker } from 'worker_threads';
import type { RandomNumberGenerationOptionsType } from '../heavy-random-operations/random.ts';

type PrimeNumberGeneratorTaskOptions = {
    numberOfPrimeNumbers: number;
    start: number | bigint;
};
type RandomNumberSumTaskOptions = RandomNumberGenerationOptionsType;

type PrimeNumberTaskResult = Array<number | bigint>;
type RandomNumberSumResult = number;

export type TaskMap = {
    primeNumbers: {
        options: PrimeNumberGeneratorTaskOptions;
        result: PrimeNumberTaskResult;
    };
    randomNumberSum: {
        options: RandomNumberSumTaskOptions;
        result: RandomNumberSumResult;
    };
};
type TaskType = keyof TaskMap;

export type GenericTask<T extends TaskType = TaskType> = {
    taskName: T;
    options: TaskMap[T]['options'];
    resolve: (result: TaskMap[T]['result']) => void;
    reject: (reason: Error) => void;
};
export type GenericWorkerTask<T extends TaskType> = Omit<GenericTask<T>, 'resolve' | 'reject'>;

export type Task = GenericTask<'primeNumbers'> | GenericTask<'randomNumberSum'>;
export type WorkerTask = GenericWorkerTask<'primeNumbers'> | GenericWorkerTask<'randomNumberSum'>


export interface PoolWorker extends Worker {
    currentTask?: Task;
}

export type TaskResults = TaskMap[TaskType]['result'];
export type ExtractTaskResult<T extends Task> = T extends { taskName: infer N } ? (N extends keyof TaskMap ? TaskMap[N]['result'] : never) : never;

