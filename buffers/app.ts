import type Runnable from '../interfaces.ts';
import { Buffer } from 'buffer';

export default class BufferRunnable implements Runnable {
    public run() {
        // 0100 1000 0110 1001 0010 0001
        
        const buff = Buffer.alloc(24 / 8)
        buff[0] = 0x48;
        buff[1] = 0x69;
        buff[3] = 0x21;

        console.log(buff.toString('utf-8'));
        console.log(buff.toString('utf16le')); // is this chinese?
        process.exit(0);
    }

}