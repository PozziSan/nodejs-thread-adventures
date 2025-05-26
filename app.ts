import { Worker } from 'worker_threads';
import { MessageChannel } from 'worker_threads';

const THREAD_FILE = './thread.ts';
const { port1, port2 } = new MessageChannel();

void (() => {
    const thread1 = new Worker(THREAD_FILE, { workerData: { port: port1, name: 'thread1' }, transferList: [port1] });
    const thread2 = new Worker(THREAD_FILE, { workerData: { port: port2, name: 'thread2' }, transferList: [port2] });

    setTimeout(() => {
        console.log('Hasta la vista');
        const message = 'exit';

        thread1.postMessage(message);
        thread2.postMessage(message);
    }, 7000);

    const finishMessage = (id: string) => console.log(`thread ${id} finished`);

    thread1.on('exit', () => finishMessage('thread1'));
    thread2.on('exit', () => finishMessage('thread2'));
})();
