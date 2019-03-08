'use strict';

const paths = require('../config/paths');
const chalk = require('chalk');
const S3Service = require('aws-sdk/clients/s3');
const fs = require('fs');
const pkg = require(paths.appPackageJson);
const mime = require('mime');

console.log(chalk.green(`Trying to publish version: ${pkg.version}`));

const isProduction = process.env.NODE_ENV === 'production';
const bucketName = isProduction ? pkg.buckets.production : pkg.buckets.staging;
const localFile = fileName => `${paths.appBuild}/${fileName}`;
const bucketKey = file => `releases/${pkg.libraryName}/${pkg.version}/${file}`;

const contentType = fileName => mime.getType(fileName);

const s3 = new S3Service({
  apiVersion: '2006-03-01',
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_ACCESS_SECRET,
  region: 'eu-west-1',
  maxRetries: 3, // this is the default
  retryDelayOptions: { base: 1000 }, // this is the default
});

const uploadParams = fileName => {
  const fileStream = fs.createReadStream(localFile(fileName));
  return {
    Bucket: bucketName,
    Key: bucketKey(fileName),
    ACL: 'public-read',
    Body: fileStream,
    ContentDisposition: `inline; filename="${fileName}"`,
    ContentType: `${contentType(fileName)}; charset=utf-8`,
  };
};

const headOpts = fileName => {
  return {
    Bucket: bucketName,
    Key: bucketKey(fileName),
  };
};

const uploaderFunc = fileName => {
  const params = uploadParams(fileName);

  if (fs.existsSync(localFile(fileName))) {
    s3.putObject(params)
      .promise()
      .then(data => {
        console.log(
          chalk.green(`Uploaded to ${params.Key} in ${params.Bucket}`)
        );
      })
      .catch(error => {
        console.log(chalk.red(`Unable to upload due to: ${error.stack}`));
      });
  } else {
    console.log(
      chalk.yellow(`There is no file named ${fileName} on the filesytem!`)
    );
  }
};

const forceIntoProd = !!process.argv.find(val => val === '--force');
const uploadToS3 = fileName => {
  s3.headObject(headOpts(fileName), err => {
    if (err || forceIntoProd || !isProduction) {
      uploaderFunc(fileName);
    } else {
      console.log(
        chalk.red(
          `There is already a file named: ${fileName} using the tag ${
            pkg.version
          } on ${bucketName} bucket!`
        )
      );
    }
  });
};

const VALID_FILE = isProduction
  ? /(min.js|min.css)$/i
  : /(min.js|min.js.map|min.css|min.css.map)$/i;
fs.readdir(paths.appBuild, (err, files) => {
  files.filter(file => VALID_FILE.test(file)).forEach(uploadToS3);
});
