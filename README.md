## Amazon ECS Redeploy Action for GitHub Actions

Redeploys a service in an ECS cluster

**Table of Contents**

<!-- toc -->

- [Usage](#usage)
- [License Summary](#license-summary)

<!-- tocstop -->

## Usage

```yaml
     - name: Build Play App
        id: build-app
        uses: retentionscience/rs-github-action-play-build
        with:
          env: stg
          ecr_uri: 123456789.dkr.ecr.us-east-1.amazonaws.com/rate-limit-service
          service_name: rate-limit-service
```
* env is optional, $ENV is used instead.
* service_name is optional, otherwise derived from $GITHUB_REPOSITORY.
* ecr_uri is optional, otherwise derived from describing repo named for the service.

## License Summary

This code is made available under the MIT license.
