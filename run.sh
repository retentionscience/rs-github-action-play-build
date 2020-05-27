#!/bin/bash

set -euo pipefail
if [[ ! -z ${VERBOSE+x} ]]; then
  set -x
fi

if [ -z "$SERVICE_NAME" ];then
	SERVICE_NAME=$(echo $GITHUB_REPOSITORY | sed 's/.*\///')
fi

sbt docker:publishLocal
IMAGE_TAG=$(find '.' -name version.sbt | head -n1 | xargs grep ':=' | sed 's/.*"\(.*\)".*/\1/')
docker tag "$SERVICE_NAME:$IMAGE_TAG" "$ECR_REGISTRY/$SERVICE_NAME:$ENV"
docker push $ECR_REGISTRY/$SERVICE_NAME:$ENV

