const core = require("@actions/core");
const aws = require("aws-sdk");


async function run() {
  try {
    var ecrUri = core.getInput("ecr_uri", { required: false });
    var env = core.getInput("env", { required: false });
    var serviceName = core.getInput("service_name", { required: false });

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
        core.setFailed('sbt docker:publishLocal errored.');
	return;
    }


    var fs = require('fs');
    var versionstr = fs.readFileSync('version.sbt', 'utf8');
    core.info(`Found versionstr: ${versionstr}`)
    var version = versionstr.split(" := ")[1];
    core.info(`Found quoted version: ${version}`)
    version = version.replace(/"/g, "");
    core.info(`Final version: ${version}`)


    var tag = spawnSync("docker",['tag',`${serviceName}:${version}`,`${ecr_uri}:${env}`]);
    core.info(`stderr: ${tag.stderr}`);
    core.info(`stdout: ${tag.stdout}`);
    if (tag.status != 0) {
        core.setFailed(`docker tag ${serviceName}:${version} ${ecr_uri}:${env} errored.`);
	return;
    }

    var push = spawnSync("docker",['push',`${ecr_uri}:${env}`]);
    core.info(`stderr: ${push.stderr}`);
    core.info(`stdout: ${push.stdout}`);
    if (push.status != 0) {
        core.setFailed(`docker push ${ecr_uri}:${env} errored.`);
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
