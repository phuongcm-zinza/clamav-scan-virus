// const { execSync } = require("child_process");
// const { writeFileSync, unlinkSync } = require("fs");
// const AWS = require("aws-sdk");
// const mysql = require('mysql');
const path = require('path');

// const s3 = new AWS.S3();

const abc = async () => {


    // // get the file
    // const s3Object = await s3
    //   .getObject({
    //     Bucket: 'ma-dev-stg',
    //     Key: 'files/2022/06/27/eicar.com.txt'
    //   })
    //   .promise();

    const filename = path.basename('files/2022/06/27/eicar.com.txt');

    console.log(filename);

    // write file to disk
    // writeFileSync(`/tmp/eicar.com.txt`, s3Object.Body);
    

    // console.log(s3Object);

  //   // delete the temp file
  //   unlinkSync(`/tmp/${record.s3.object.key}`);
//   }
};

abc()
