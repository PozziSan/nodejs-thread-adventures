import HeavyRandomOperationsApp from './heavy-random-operations/app.ts';
import type Runnable from './interfaces.ts';

import Messaging from './messaging/app.ts';
import PrimeNumberGeneratorHttpServer from './prime-generator-http-server/app.ts';
import PrimeGenerator from './prime-generator/app.ts';
import SemaphoreRunnable from './semaphore/app.ts';
import SharedMemoryRunnable from './shared-memory/app.ts';
import ThreadPoolSharedMemoryRunnable from './thread-pool-shared-memory/app.ts';
import ThreadPoolRunnable from './thread-pool/app.ts';

const RunnableInputsMapping: Record<string, Runnable> = {
    messaging: new Messaging(),
    'prime-generator': new PrimeGenerator(),
    'prime-generator-http-server': new PrimeNumberGeneratorHttpServer(),
    'heavy-random-operations': new HeavyRandomOperationsApp(),
    'thread-pool': new ThreadPoolRunnable(),
    'shared-memory': new SharedMemoryRunnable(),
    semaphore: new SemaphoreRunnable(),
    'thread-pool-shared-memory': new ThreadPoolSharedMemoryRunnable(),
};

void (async () => {
    const input = process.argv[2];

    console.log('Input is: ', input);
    const runnable = RunnableInputsMapping[input];

    if (!runnable) throw new Error('Runnable not registered!');

    await runnable.run();
})();
