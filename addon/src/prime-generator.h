#ifndef PRIME_GENERATOR_H
#define PRIME_GENERATOR_H

#include <vector>
#include <string>
#include <gmp.h>

bool isPrime(long long n);
bool isPrime(mpz_t n);

long long nextPrime(long long n);
void nextPrime(mpz_t result, const mpz_t n);

std::string formatNumberWithCommas(long long number);
std::string formatNumberWithCommas(const mpz_t number);

std::vector<std::string> generatePrimes(int count, long long startingNumber, bool format, bool log);
std::vector<std::string> generatePrimes(int count, const mpz_t startingNumber, bool format, bool log);
std::vector<std::string> generatePrimes(int count, const std::string startingNumber, bool format, bool log);

std::vector<std::string> generatePrimesThreads(int threadCount, int count, const std::string startingNumber, bool format, bool log);

#endif