import { workerData, threadId } from 'worker_threads';

const sharedData = Buffer.from(workerData.sharedData);
const data = workerData.data as string;

console.log(`Thread: ${threadId} - sharedData: ${sharedData}; data: ${data}`);

sharedData.write(data);
