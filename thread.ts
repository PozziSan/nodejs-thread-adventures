import { workerData, parentPort } from 'worker_threads';

import type { MessagePort } from 'worker_threads';

type workerDataType = {
    port: MessagePort;
    name: string;
};

const { port, name } = workerData as workerDataType;

port.postMessage(`Hello from ${name}`);

port.on('message', (msg: string) => {
    console.log(`Received message on ${name}: ${msg}`);
});

parentPort?.on('message', (msg: string) => {
    if (msg === 'exit') {
        console.log('exit message received on', name);
        process.exit(0);
    }

    console.log(`Received message from parent: ${msg}`);
});
