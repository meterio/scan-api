#!/bin/bash

docker build -t meterio/scan-api:main-standby .
docker push meterio/scan-api:main-standby