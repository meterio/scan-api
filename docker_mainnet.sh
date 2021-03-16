#!/bin/bash

docker build -t meterio/scan-api:mainnet .
docker push meterio/scan-api:mainnet