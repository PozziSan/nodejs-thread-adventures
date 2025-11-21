#include <napi.h>
#include "prime-generator.h"

class GeneratePrimesWrapper : public Napi::AsyncWorker {
    public:
        GeneratePrimesWrapper(Napi::Function& callback, int count, std::string startingNumber, bool format, bool log, int threads)
            : Napi::AsyncWorker(callback), count(count), startingNumber(startingNumber), format(format), log(log), threads(threads) {}
        
        void Execute() override {
            primes = generatePrimesThreads(threads > 1 ? threads : 1, count, startingNumber, format, log);
        }

        void OnOK() override {
            Napi::Env env = Env();
            Napi::Array jsPrimes = Napi::Array::New(env, primes.size());

            for (size_t i = 0; i < primes.size(); ++i) {
                jsPrimes[i] = Napi::String::New(env, primes[i]);
            }

            Callback().Call({ env.Null(), jsPrimes }); // pushing callback to queue
        }

    private:
        int count;
        std::string startingNumber;
        bool format;
        bool log;
        int threads;
        std::vector<std::string> primes;
};

Napi::Value GeneratePrimesBind(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 3 || info.Length() > 4) {
        Napi::TypeError::New(env, "Expected three or four arguments").ThrowAsJavaScriptException();

        return env.Null();
    }

    if (!info[0].IsNumber() || !info[1].IsString() || !info[info.Length() - 1].IsFunction()) {
        Napi::TypeError::New(env, "Invalid Arguments").ThrowAsJavaScriptException();

        return env.Null();
    }

    int count = info[0].As<Napi::Number>().Int32Value();
    std::string startingNumber = info[1].As<Napi::String>();
    Napi::Function callback = info[info.Length() - 1].As<Napi::Function>();

    bool format = false;
    bool log = false;
    int threads = 1;

    if (info.Length() == 4 && info[2].IsObject()) {
        Napi::Object options = info[2].As<Napi::Object>();
        format = options.Has("format") ? options.Get("format").As<Napi::Boolean>() : false;
        log = options.Has("log") ? options.Get("log").As<Napi::Boolean>() : false;
        threads = options.Has("threads") ? options.Get("threads").As<Napi::Number>().Int32Value() : 1;
    }

    GeneratePrimesWrapper* generatePrimes = new GeneratePrimesWrapper(callback, count, startingNumber, format, log, threads);
    generatePrimes->Queue();

    return env.Undefined();
}

// Testing Only
Napi::Value Add(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 2) {
        Napi::TypeError::New(env, "Expected two arguments").ThrowAsJavaScriptException();

        return env.Null();
    }

    if (!info[0].IsNumber() || !info[1].IsNumber()) {
        Napi::TypeError::New(env, "Expected both arguments to be numbers").ThrowAsJavaScriptException();

        return env.Null();
    }

    int firstNumber = info[0].As<Napi::Number>().Int32Value();
    int secondNumber = info[1].As<Napi::Number>().Int32Value();

    int sum = firstNumber + secondNumber;

    return Napi::Number::New(env, sum);
}

extern "C" int add_asm(int a, int b);

__asm__( // Assembly impl for Apple Silicon (ARM64)
    ".global _add_asm\n"
    ".align 2\n"
    "_add_asm:\n"
    "   add w0, w0, w1\n"
    "   ret\n"
);

Napi::Value AddAsm(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (info.Length() < 2) {
        Napi::TypeError::New(env, "Expected two arguments").ThrowAsJavaScriptException();

        return env.Null();
    }

    if (!info[0].IsNumber() || !info[1].IsNumber()) {
        Napi::TypeError::New(env, "Expected both arguments to be numbers").ThrowAsJavaScriptException();

        return env.Null();
    }

    int firstNumber = info[0].As<Napi::Number>().Int32Value();
    int secondNumber = info[1].As<Napi::Number>().Int32Value();

    int sum = add_asm(firstNumber, secondNumber);

    return Napi::Number::New(env, sum);
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "generatePrimes"), Napi::Function::New(env, GeneratePrimesBind));
    exports.Set(Napi::String::New(env, "add"), Napi::Function::New(env, Add));
    exports.Set(Napi::String::New(env, "addAsm"), Napi::Function::New(env, AddAsm));

    return exports;
}

NODE_API_MODULE("heavy-lifter", Init);
