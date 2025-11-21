import type Runnable from '../interfaces.ts';
import { promisify } from 'util';

import { createRequire } from 'module';

const cppAddon = createRequire(import.meta.url)('../build/Release/heavy-lifter.node');

// !IMPORTANT: You need to execute the steps defined in README file to build CPP dependencies here.

export default class CppAddonsRunnable implements Runnable {
    public async run(): Promise<void> {
        const startAddCpp = performance.now();
        const resultAddCpp = cppAddon.add(1, 2);
        const endAddCpp = performance.now();

        console.log('Add CPP Result: ', resultAddCpp);
        console.log(`Add CPP Time Taken: ${endAddCpp - startAddCpp}ms`);

        const startAddAsm = performance.now();
        const resultAddAsm = cppAddon.addAsm(1, 2);
        const endAddAsm = performance.now();

        console.log('Add ASM Result: ', resultAddAsm);
        console.log(`Add ASM Time Taken: ${endAddAsm - startAddAsm}ms`);

        console.log('--------------------------------------------------------');
        console.log('Generating Prime Numbers in CPP!');

        const generatePrimesCPP = promisify(cppAddon.generatePrimes);
        const count = 10_000;
        const startingNumber = '1000000000000';
        const threads = 8;

        console.log(`Generating ${count} prime numbers starting from ${startingNumber}`);
        console.log('--------------------------------------------------------');
        console.log('Testing with a single Thread');

        const startPrimesSingleThread = performance.now();
        const primesSingleThread = await generatePrimesCPP(count, startingNumber, { format: true, log: false });
        const endPrimesSingleThread = performance.now();
        console.log(`Time Taken using 1 Thread in CPP: ${endPrimesSingleThread - startPrimesSingleThread}ms`);
        // console.log(primesSingleThread);

        console.log('--------------------------------------------------------');
        console.log(`Testing with ${threads} Threads`);

        const startMultipleThreads = performance.now();
        const primesMultipleThreads = await generatePrimesCPP(
            count,
            startingNumber,
            { format: true, log: false, threads },
        );
        const endPrimesMultipleThreads = performance.now();
        console.log(`Time Taken using ${threads} Thread in CPP: ${endPrimesMultipleThreads - startMultipleThreads}ms`);
        console.log('--------------------------------------------------------');

        process.exit(0);
    }
}
