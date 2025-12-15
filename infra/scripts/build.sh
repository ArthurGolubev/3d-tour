#!/bin/bash
cd ../../
docker build -t 3d-tour:latest -f infra/Docker/Dockerfile .
docker tag 3d-tour:latest registry.iteo.pro/3d-tour:latest
docker push registry.iteo.pro/3d-tour:latest