import { Worker } from 'worker_threads';
import type { Task, PoolWorker, TaskResults, ExtractTaskResult, WorkerTask } from './types.ts';

export default class Pool {
    private readonly threadNumber: number;
    private readonly threads: PoolWorker[];
    private readonly idleThreads: PoolWorker[];
    private readonly scheduledTasks: Task[];

    public constructor(threadNumber: number) {
        this.threadNumber = threadNumber;
        this.threads = [];
        this.scheduledTasks = [];
        this.idleThreads = [];
        this.startPool();
    }

    public startPool() {
        if (this.threads.length) {
            console.log(`Pool already started and running. There are: ${this.threads.length} running Threads.`);
            return;
        }

        console.log('--------------------');
        console.log('Started Thread Pool!');
        console.log('--------------------');

        for (let i = 0; i < this.threadNumber; i++) {
            this.spawnThread();
        }
    }

    private spawnThread() {
        const thread = new Worker('./thread-pool/thread.ts') as PoolWorker;
        console.log(`Spawned Thread: ${thread.threadId}`);

        thread.on('message', (result: TaskResults) => this.handleResult(thread, result));
        thread.on('error', (reason) => this.handleError(thread, reason));

        this.threads.push(thread);
        this.idleThreads.push(thread); // In the begging all threads are idle
    }

    private handleError(thread: PoolWorker, reason: Error) {
        console.log(`There was an Error on Thread ${thread.threadId}: ${reason}`);

        thread.currentTask!.reject(reason);
        thread.currentTask = undefined;
        this.runNextTask();
    }

    private handleResult(thread: PoolWorker, result: TaskResults) {
        console.log(`Thread ${thread.threadId} finished. Resolving Promise`);

        (thread.currentTask!.resolve as (result: TaskResults) => void)(result);

        this.idleThreads.push(thread);
        thread.currentTask = undefined;

        console.log(`Promise resolved for thread: ${thread.threadId}. Running next task`);
        this.runNextTask();
    }

    private runNextTask() {
        if (this.scheduledTasks.length && this.idleThreads.length) {
            const task = this.scheduledTasks.shift()!;
            console.log(`Found new task to run: ${task.taskName}`);

            const thread = this.idleThreads.shift()!;

            thread.currentTask = task;
            thread.postMessage(this.convertTaskIntoWorkerTask(task));
            console.log(`Submitted new task for thread: ${thread?.threadId}: ${task.taskName}`);
        }
    }

    private convertTaskIntoWorkerTask(task: Task): WorkerTask {
        const { resolve, reject, ...workerTask } = task;

        return workerTask;
    }

    public async run<T extends Task>(task: T): Promise<ExtractTaskResult<T>> {
        return new Promise<ExtractTaskResult<T>>((resolve, reject) => {
            const promiseTask = {
                ...task,
                resolve,
                reject,
            } satisfies T;

            this.scheduledTasks.push(promiseTask);
            console.log(`Scheduled a new task: ${task.taskName}`);
            this.runNextTask();
        });
    }

    public async destroy() {
        if (!this.threads.length) {
            console.log("There isn't any thread to destroy!");
            return;
        }

        await Promise.all(
            this.threads.map((thread) => {
                console.log(`Terminating thread: ${thread.threadId}`);
                thread.terminate();
            })
        );

        this.threads.length = 0;
        this.idleThreads.length = 0;
        this.scheduledTasks.length = 0;
        console.log('Destroyed Thread Pool!');
    }
}
