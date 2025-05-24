import { Worker } from "worker_threads";

const THREAD_FILE = "./thread.ts";

void (() => {
    const thread1 = new Worker(THREAD_FILE);
    const thread2 = new Worker(THREAD_FILE);

    const finishMessage = (id: string) => console.log(`thread ${id} finished`);

    thread1.on("exit", () => finishMessage("thread1"));
    thread2.on("exit", () => finishMessage("thread2"));
})();
