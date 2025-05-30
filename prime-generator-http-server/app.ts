import type Runnable from '../interfaces.ts';
import server from './http.ts';

export default class PrimeNumberGeneratorHttpServer implements Runnable {
    public run(): void {
        server.listen(3000, () =>
            console.log(
                "we're now generating prime numbers on port 3000. Will we do it in a single thread? Or in multiple ones? A mystery only you can solve"
            )
        );
    }
}
