// C++ test with local includes
#include "../../src/utils.h"
#include <cassert>
#include <iostream>

void test_add_function() {
    assert(add(2, 3) == 5);
    assert(add(-1, 1) == 0);
    assert(add(0, 0) == 0);
    std::cout << "test_add_function passed\n";
}

void test_multiply_function() {
    assert(multiply(2, 3) == 6);
    assert(multiply(-2, 3) == -6);
    assert(multiply(0, 5) == 0);
    std::cout << "test_multiply_function passed\n";
}

void test_factorial_function() {
    assert(factorial(0) == 1);
    assert(factorial(1) == 1);
    assert(factorial(5) == 120);
    std::cout << "test_factorial_function passed\n";
}

int main() {
    test_add_function();
    test_multiply_function();
    test_factorial_function();
    std::cout << "All C++ tests passed!\n";
    return 0;
}
