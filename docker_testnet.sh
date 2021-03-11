#!/bin/bash

docker build -t meterio/scan-api:testnet .
docker push meterio/scan-api:testnet