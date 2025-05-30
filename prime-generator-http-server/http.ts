import http from 'http';
import url from 'url';

import generatePrimes from '../prime-generator/PrimeGenerator.ts';

import { performance } from 'perf_hooks';
import { Worker } from 'worker_threads';

const sendResponse = (start: number, primeNumbers: Array<number | bigint>, res: http.ServerResponse) => {
    const body = { primes: primeNumbers, timeTaken: performance.now() - start };
    return res.writeHead(200).end(JSON.stringify(body));
};

const server = http.createServer((req, res) => {
    if (req.method !== 'GET') throw new Error('Only GET Method is allowed');
    if (!req.url) throw new Error('There should be an url');

    const parsedUrl = url.parse(req.url, true);
    const { pathname } = parsedUrl;

    if (pathname !== '/api/primeNumbers') return res.writeHead(404, 'Not Found').end();

    const runInThread = Boolean(parsedUrl.query.runInThread);
    const quantity = Number(parsedUrl.query.quantity) ?? 100;
    const parsedQueryNumber = Number(parsedUrl.query.startNumber);
    const startNumber = Number.isNaN(parsedQueryNumber) ? 1_000_000_000_000 : parsedQueryNumber;

    const start = performance.now();

    console.log(`Generating ${quantity} prime numbers starting from ${startNumber}`);

    if (!runInThread) {
        console.log(
            "We're blocking the main thread because we like adventure, emotion, risks, and staying all night long solving issues because a single user is blocking our application worldwide!"
        );
        const primeNumbers = generatePrimes(quantity, startNumber) as number[]; // this will block the main thread
        return sendResponse(start, primeNumbers, res);
    }

    console.log(
        'Wow, now everything is inside a thread and our main thread is safe so lots of users can do requests and use the power of nodejs non blocking asyncio'
    );
    const thread = new Worker('./prime-generator-http-server/thread.ts', { workerData: { startNumber, quantity } });
    thread.on('message', (primeNumbers) => {
        return sendResponse(start, primeNumbers, res);
    });
});

export default server;
