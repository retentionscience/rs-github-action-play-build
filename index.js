const core = require("@actions/core");
const aws = require("aws-sdk");


async function run() {
  try {
    var ecrUri = core.getInput("ecr_uri", { required: false });
    var env = core.getInput("env", { required: false });
    var serviceName = core.getInput("service", { required: false });

    if (env == "") {
       env=process.env.ENV;
    }
    if (serviceName == "") {
       serviceName=process.env.GITHUB_REPOSITORY.split('/')[1];
    }

    if (ecrUri == "") {
       core.debug(`Describing ECR for ${serviceName}`);
       const ecr = new aws.ECR();
       const params = {
         repositoryNames: [serviceName]
       };
       var ecr_data = await ecr.describeRepositories(params).promise();
       var ecr_uri = ecr_data.repositories[0].repositoryUri
    }

    core.info(`Starting build with env:${env} service:${serviceName} ecr_uri:${ecr_uri}`);


    const { spawnSync } = require("child_process");

    var sbt = spawnSync("sbt",["docker:publishLocal"]);
    core.info(`stderr: ${sbt.stderr}`);
    core.info(`stdout: ${sbt.stdout}`);
    if (sbt.status != 0) {
        core.setFailed(`sbt docker:publishLocal returned ${sbt.status}`);
	return;
    }


    var fs = require('fs');
    var versionstr = fs.readFileSync('version.sbt', 'utf8');
    var version = versionstr.split(" := ")[1];
    version = version.replace(/"/g, "");
    core.info(`Found version: ${version}`)


    core.info(`Spawning: docker tag ${serviceName}:${version} ${ecr_uri}:${env}`);
    var tag = spawnSync("docker",['tag',`${serviceName}:${version}`,`${ecr_uri}:${env}`]);
    core.info(`stderr: ${tag.stderr}`);
    core.info(`stdout: ${tag.stdout}`);
    if (tag.status != 0) {
        core.setFailed(`docker tag ${serviceName}:${version} ${ecr_uri}:${env} returned ${tag.status}.`);
	return;
    }


    core.info(`Spawning: docker push ${ecr_uri}:${env}`);
    var push = spawnSync("docker",['push',`${ecr_uri}:${env}`]);
    core.info(`stderr: ${push.stderr}`);
    core.info(`stdout: ${push.stdout}`);
    if (push.status != 0) {
        core.setFailed(`docker push ${ecr_uri}:${env} returned ${push.status}`);
	return;
    }


  } catch (error) {
    core.setFailed(error.message);
  }
}

module.exports = run;

/* istanbul ignore next */
if (require.main === module) {
  run();
}
