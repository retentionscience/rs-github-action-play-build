#!/bin/bash

set -euo pipefail
if [[ ! -z ${VERBOSE+x} ]]; then
  set -x
fi

if [ -z "$SERVICE_NAME" ];then
	SERVICE_NAME=$(echo $GITHUB_REPOSITORY | sed 's/.*\///')
fi
if [ -z "$ECR_REGISTRY" ];then
	ECR_URI=$(aws ecr describe-repositories --repository-names rate-limit-service | jq -r '.repositories[].repositoryUri')
else
	ECR_URI="$ECR_REGISTRY/$SERVICE_NAME"
fi

sbt docker:publishLocal
IMAGE_TAG=$(find '.' -name version.sbt | head -n1 | xargs grep ':=' | sed 's/.*"\(.*\)".*/\1/')
docker tag $SERVICE_NAME:$IMAGE_TAG $ECR_URI:$ENV
docker push $ECR_URI:$ENV

