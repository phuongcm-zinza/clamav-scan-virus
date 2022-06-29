const { execSync } = require("child_process");
const { writeFileSync, unlinkSync } = require("fs");
const AWS = require("aws-sdk");
const mysql = require('mysql');
const path = require('path');

const s3 = new AWS.S3();

module.exports.virusScan = async (event, context) => {
  if (!event.Records) {
    console.log("Not an S3 event invocation!");
    return;
  }

  for (const record of event.Records) {
    if (!record.s3) {
      console.log("Not an S3 Record!");
      continue;
    }

    // get the file
    const s3Object = await s3
      .getObject({
        Bucket: record.s3.bucket.name,
        Key: record.s3.object.key
      })
      .promise();

    const filename = path.basename(record.s3.object.key);

    // write file to disk
    writeFileSync(`/tmp/${filename}`, s3Object.Body);

    try { 
      // scan it
      execSync(`./bin/clamscan --database=./var/lib/clamav /tmp/${filename}`);
      // if clean do nothing
    } catch(err) {
      if (err.status === 1) {
        const s3Obj = await s3
        .getObjectTagging({
          Bucket: record.s3.bucket.name,
          Key: record.s3.object.key,
        })
        .promise();
        
        console.log('====Start handler delete file====');

        const data = {
          'path' : record.s3.object.key,
          'tags' : JSON.stringify(s3Obj.TagSet)
        };

        console.log('----111---', JSON.stringify(data));

        try {
          var db_connection = await mysql.createConnection({
            host: 'ma-dev-database.c3frwvidxt8s.ap-northeast-1.rds.amazonaws.com',
            user: 'ma_dev',
            password: 'HZkKsXxvn5S7Pmae',
            port: 3306,
            database: 'ma_dev'
          });

          console.log('======2=====');
  
          // insert to DB
          db_connection.query('INSERT INTO virus_files SET ?', data, (err, result) => {
              if (err) {
                response = {statusCode: 500, body:{message:"Database Connection Failed", error: err}};
                console.log(response);
              } else {
                console.log(JSON.stringify(result));
              }          
          });
  
  
          // if has virus delete it
          await s3
            .deleteObject({
              Bucket: record.s3.bucket.name,
              Key: record.s3.object.key,
            })
            .promise();
        } catch (err) {
          console.log('---error-----', JSON.stringify(err))
        }
      }
    }

    // delete the temp file
    unlinkSync(`/tmp/${filename}`);
  }
};
