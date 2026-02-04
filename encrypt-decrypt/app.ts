import type Runnable from '../interfaces.ts';
import { open } from 'fs/promises';
import EncryptStream from './encrypt.ts';
import DecryptStream from './decrypt.ts';
import ProgressStream from './progress.ts';
import { pipeline } from 'stream/promises';

export default class EncryptDecryptRunnable implements Runnable {
    private readonly inputFilePath = 'encrypt-decrypt/input.txt';
    private readonly encryptedFilePath = 'encrypt-decrypt/encrypted.txt';
    private readonly finalFilePath = 'encrypt-decrypt/finalOutput.txt';

    private async encrypt() {
        await using inputFileHandle = await open(this.inputFilePath, 'r');
        await using outputFileHandle = await open(this.encryptedFilePath, 'w');
        const inputSize = (await inputFileHandle.stat()).size;

        const readStream = inputFileHandle.createReadStream();
        const writeStream = outputFileHandle.createWriteStream();
        const encryptTransformer = new EncryptStream();
        const progressTransformer = new ProgressStream('encrypted', inputSize);

        await pipeline([readStream, encryptTransformer, progressTransformer, writeStream]);
    }

    private async decrypt() {
        await using inputFileHandle = await open(this.encryptedFilePath, 'r');
        await using outputFileHandle = await open(this.finalFilePath, 'w');
        const inputSize = (await inputFileHandle.stat()).size;

        const readStream = inputFileHandle.createReadStream();
        const writeStream = outputFileHandle.createWriteStream();
        const decryptTransformer = new DecryptStream();
        const progressTransformer = new ProgressStream('decrypted', inputSize);

        await pipeline([readStream, decryptTransformer, progressTransformer, writeStream]);
    }

    public async run(): Promise<void> {
        console.log('Encrypting!');
        await this.encrypt();

        console.log('Decrypting!');
        await this.decrypt();
    }
}
