import type Runnable from "../interfaces.ts";
import {watch, open, type FileHandle} from 'fs/promises';

export default class FilesRunnable implements Runnable {
    private readonly filePath = 'files/file.txt';
    
    private async handleFileChange(fileHandler: FileHandle) {
        const { size } = await fileHandler.stat();
        const buff = Buffer.alloc(size);
        const offset = 0;
        const length = buff.byteLength;
        const position = 0;

        await fileHandler.read(buff, offset, length, position);
        console.log(buff.toString('utf-8'));
    }

    public async run(): Promise<void> {
        const watcher = watch(this.filePath);
        await using fileHandler =  await open(this.filePath, 'r');
        
        for await (const event of watcher) {
            if (event.eventType === 'change') {
                console.log('file Changed!');
                this.handleFileChange(fileHandler);
            }
        }
    }
    
}