#!/bin/bash

docker build -t meterio/scan-api:test-standby .
docker push meterio/scan-api:test-standby
