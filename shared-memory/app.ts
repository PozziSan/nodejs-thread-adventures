import { Worker } from 'worker_threads';
import type Runnable from '../interfaces.ts';

export default class SharedMemoryRunnable implements Runnable {
    public run(): void {
        const firstMessage = 'Palmeiras';
        const secondMessage = 'Campeão!';

        const sharedArrayBufferLength = Math.max(firstMessage.length, secondMessage.length);
        const sharedData = Buffer.from(new SharedArrayBuffer(sharedArrayBufferLength));

        console.log(`Original data: ${sharedData}`);

        new Worker('./shared-memory/thread.ts', { workerData: { sharedData: sharedData.buffer, data: firstMessage } });
        new Worker('./shared-memory/thread.ts', { workerData: { sharedData: sharedData.buffer, data: secondMessage } });

        setTimeout(() => {
            console.log(`Final data: ${sharedData}`);

            process.exit(1);
        }, 1000);
    }
}
