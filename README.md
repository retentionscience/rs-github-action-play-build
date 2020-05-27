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
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          SERVICE_NAME: 'rate-limit-service',
          ENV: 'stg'
```

* SERVICE_NAME is optional if it matches the name of the github repository.
* ECR_REGISTRY is optional if the ECR matches the service_name.

## License Summary

This code is made available under the MIT license.
