const core = require("@actions/core");
const aws = require("aws-sdk");


async function run() {
  try {
    var ecrRegistry = core.getInput("ecr_registry", { required: false });
    var env = core.getInput("env", { required: false });
    var serviceName = core.getInput("service_name", { required: false });

    if (ecrRegistry == "") {
       ecr_uri=process.env.ECR_REPOSITORY+"/"+serviceName
    } else {
       core.debug(`Describing ECR for ${serviceName}`);
       const ecr = new aws.ECR();
       const params = {
         repositoryNames: [serviceName]
       };
       var ecr_data = await ecr.describeRepositories(params).promise();
       var ecr_uri = ecr_data.repositories[0].repositoryUri
    }
    if (env == "") {
       env=process.env.ENV;
    }
    if (serviceName == "") {
       serviceName=process.env.GITHUB_REPOSITORY.split('/')[1];
    }

    core.info(`Starting build with env:${env} service:${serviceName} ecr_uri:${ecr_uri}`);


    const { exec } = require("child_process");

    exec("sbt docker:publishLocal", (error, stdout, stderr) => {
      if (error) {
        core.info(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        core.info(`stderr: ${stderr}`);
        return;
      }
      core.info(`stdout: ${stdout}`);
    });

    var fs = require('fs');
    var versionsbt = fs.readFile('version.sbt', 'utf8');
    var version = versionsbt.split(" : = ").replace(/"/g,"");
    core.info(`Found version: ${version}`)



    exec("docker tag ${serviceName}:${version} ${ecr_uri}:${env}", (error, stdout, stderr) => {
      if (error) {
        core.info(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        core.info(`stderr: ${stderr}`);
        return;
      }
      core.info(`stdout: ${stdout}`);
    });
    exec("docker push ${ecr_uri}:${env}", (error, stdout, stderr) => {
      if (error) {
        core.info(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        core.info(`stderr: ${stderr}`);
        return;
      }
      core.info(`stdout: ${stdout}`);
    });
	  #IMAGE_TAG=$(find '.' -name version.sbt | head -n1 | xargs grep ':=' | sed 's/.*"\(.*\)".*/\1/')
	  #docker tag $SERVICE_NAME:$IMAGE_TAG $ECR_URI:$ENV
	  #docker push $ECR_URI:$ENV


  } catch (error) {
    core.setFailed(error.message);
  }
}

module.exports = run;

/* istanbul ignore next */
if (require.main === module) {
  run();
}
