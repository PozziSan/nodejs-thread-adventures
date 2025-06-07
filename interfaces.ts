export default interface Runnable {
    run(): void | Promise<void>
};
