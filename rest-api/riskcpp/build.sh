#!/usr/bin/env bash
set -euo pipefail
mkdir -p ../lib
g++ -O3 -march=native -ffast-math -fPIC -shared risk.cpp -o ../lib/libriskcpp.so
echo "Built ../lib/libriskcpp.so"
