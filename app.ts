import type Runnable from './interfaces.ts';

import Messaging from './messaging/app.ts';
import PrimeNumberGeneratorHttpServer from './prime-generator-http-server/app.ts';
import PrimeGenerator from './prime-generator/app.ts';

const RunnableInputsMapping: Record<string, Runnable> = {
    messaging: new Messaging(),
    'prime-generator': new PrimeGenerator(),
    'prime-generator-http-server': new PrimeNumberGeneratorHttpServer(),
};

void (() => {
    const input = process.argv[2];

    console.log('Input is: ', input);
    const runnable = RunnableInputsMapping[input];

    if (!runnable) throw new Error('Runnable not registered!');

    runnable.run();
})();
