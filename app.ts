import type Runnable from "./interfaces.ts";

import Messaging from "./messaging/app.ts";

const RunnableInputsMapping: Record<string, Runnable> = {
    'messaging': new Messaging(),
};

void (() => {    
    const input = process.argv[2];

    console.log('Input is: ', input);
    const runnable = RunnableInputsMapping[input];
    
    if (!runnable) throw new Error('Runnable not registered!');

    runnable.run();
})();
