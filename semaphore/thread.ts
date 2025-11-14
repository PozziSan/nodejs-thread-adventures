import { workerData, threadId } from 'worker_threads';

type ThreadData = {
    number: SharedArrayBuffer;
    seal: SharedArrayBuffer;
};

const data = workerData as ThreadData;
const number = new Uint32Array(data.number);
const seal = new Int32Array(data.seal);

const lock = (seal: Int32Array) => {
    // If seal is 0, we store 1 to it. If seal is 1, we stop execution.
    while (Atomics.compareExchange(seal, 0, 0, 1) === 1) {
        Atomics.wait(seal, 0, 1);
    }
};

const unlock = (seal: Int32Array) => {
    // Unlock the seal by setting it to 0 and then wake up the next thread
    Atomics.store(seal, 0, 0);
    Atomics.notify(seal, 0, 1); // notify 1 single thread
};

for (let i = 0; i < 10_000_000; i++) {
    lock(seal)

    number[0] = number[0] + 1;

    unlock(seal);
}
