import crypto from 'crypto';

export type RandomNumberGenerationOptionsType =
    | { type: 'crypto'; numberOfRandomNumbers: number }
    | { type: 'math'; numberOfRandomNumbers: number }
    | { type: 'crypto-batch'; numberOfRandomNumbers: number; batchSize: number };



/**
 * Generates a cryptographically secure random 16-bit unsigned integer.
 * Uses a 2-byte buffer to store and read the random value.
 *
 * @returns {number} A random integer between 0 and 65535.
 */
function generateCryptoRandomNumber(): number {
    const buffer = Buffer.alloc(2);
    crypto.randomFillSync(buffer);

    return buffer.readUInt16BE(0); // read the buffer as an unsigned 16-bit integer
}

/**
 * Sums several cryptographically secure random 16-bit integers,
 * refilling the buffer in batches for efficiency.
 *
 * @param {number} numberOfRandomNumbers - How many random numbers to sum.
 * @param {number} batchSize - How many numbers to generate per batch.
 * @returns {number} The sum of the generated random numbers.
 */
function generateSumOfCryptoRandomNumbersWithBatches(numberOfRandomNumbers: number, batchSize: number): number {
    const buffer = Buffer.alloc(batchSize);
    let sum = 0;
    let random: number;
    let bufferOffset = 0;

    crypto.randomFillSync(buffer);

    for (let i = 0; i < numberOfRandomNumbers; i++) {
        if (bufferOffset >= batchSize) {
            crypto.randomFillSync(buffer);
            bufferOffset = 0;
        }

        random = buffer.readUInt16BE(bufferOffset);
        sum += random;
        bufferOffset += 2; // Moving to the next 16 bit

        if (sum > 100_000_000) sum = 0; // I don't want to deal if bigint here.
    }

    return sum;
}

/**
 * Sums several cryptographically secure random 16-bit integers,
 * generating each number individually using a 2-byte buffer.
 *
 * @param {number} numberOfRandomNumbers - How many random numbers to sum.
 * @returns {number} The sum of the generated random numbers.
 */
function generateSumOfCryptoRandomNumbers(numberOfRandomNumbers: number): number {
    let sum = 0;
    let random: number;

    for (let i = 0; i < numberOfRandomNumbers; i++) {
        random = generateCryptoRandomNumber();
        sum += random;

        if (sum > 100_000_000) sum = 0; // I don't want to deal if bigint here.
    }

    return sum;
}

/**
 * Generates the sum of several random numbers using Math.random().
 *
 * @param {number} numberOfRandomNumbers - The number of random numbers to generate and sum.
 * @returns {number} The sum of the generated random numbers.
 */
function generateSumOfMathRandomNumbers(numberOfRandomNumbers: number): number {
    let sum = 0;
    let random: number;

    for (let i = 0; i < numberOfRandomNumbers; i++) {
        random = Math.floor(Math.random() * 10000);
        sum += random;

        if (sum > 100_000_000) {
            // I don't want to deal if bigint here.
            sum = 0;
        }
    }

    return sum;
}

/**
 * Generates the sum of random numbers according to the provided options.
 *
 * @param {RandomNumberGenerationOptionsType} options - Options for random number generation, including type and quantity.
 * @returns {number} The sum of the generated random numbers according to the specified type.
 * @throws {Error} If the generation type is invalid.
 */
export function generateSumOfRandomNumbers(options: RandomNumberGenerationOptionsType): number {
    const { type, numberOfRandomNumbers } = options;

    switch (type) {
        case 'crypto':
            return generateSumOfCryptoRandomNumbers(numberOfRandomNumbers);
        case 'math':
            return generateSumOfMathRandomNumbers(numberOfRandomNumbers);
        case 'crypto-batch':
            return generateSumOfCryptoRandomNumbersWithBatches(numberOfRandomNumbers, options.batchSize);
        default:
            throw new Error('Invalid generation type');
    }
}
