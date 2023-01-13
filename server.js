const express = require('express');
require('dotenv').config();
const app = express()
const port = 3100



const crypto = require('crypto')
const mysql = require('mysql');

var fs = require('fs');
var requestCount = 0
host = '';
user = '';
password = '';
database = '';
pythonUrl = "";
apiKey= "";
appSecret = "";
tokenUrl = "";
pushQualifiedUrl = "";
type22 = '';



try {

    host = process.env.HOST
    user = process.env.USER;
    password = process.env.PASSWORD;
    database = process.env.DATABASE;
    pythonUrl = process.env.PYTHONURL;
    // apiKey = process.env.APIKEY;
    // appSecret = process.env.APPSECRET;
    // tokenUrl = process.env.TOKENURL;
    // pushQualifiedUrl = process.env.PUSHQUALIFIEDURL;
    console.log("===========")
    console.log("Done reading settings variables", host, user);
    console.log("===========")
  
  }
  catch(e) {
    console.log('Error:', e.stack);
  }
  
  var isConnectedToDB = false
  var lastOpStat = {}
  
  const connection = mysql.createConnection({
    host: host,
    user: user,
    password: password,
    database: database
  });
  // make the connection and other settings configurable in a txt config file
  
  
//   database main functions
  async function makeConnection() {
    connection.connect(function(err) {
      if (err) {
        return console.error('error: ' + err.message);
      }
  
      console.log('Connected to the MySQL server.');
      isConnectedToDB = true;
    });
  }
  
  async function closeConnection() {
    connection.end(function(err) {
      if (err) {
        return console.log('error:' + err.message);
      }
      console.log('Close the database connection.');
    });
  }

  async function doQuery(queryToDo) {
    let pro = new Promise((resolve,reject) => {
        let query = queryToDo;
        connection.query(query, function (err, result) {
            if (err)
            {
              throw err;
              // resolve (0)
            }
            else {
              resolve(result);
            }
        });
    })
    return pro.then((val) => {
        return val;
    })
  }
  

  async function recordsFromATableGrab(type, regNo, tableName, condition=false) {
    // console.log("@RECORDS FROM A TABLE GRAB", type)
  
    var sql = ""
    if (type == "UTME") {
      if (condition) {
        sql = `SELECT
    reg_num, fullname, sex, state, utme_aggregate, department, lga, subject_1, subject_1_score, subject_2,
    subject_2_score, subject_3, subject_3_score, english_score, phone, email, password, bio_data
    FROM ${tableName} WHERE reg_num = '${regNo}'
    `
      }
      else {
      sql = `SELECT
    reg_num, fullname, sex, state, utme_aggregate, department, lga, subject_1, subject_1_score, subject_2,
    subject_2_score, subject_3, subject_3_score, english_score
    FROM ${tableName} WHERE reg_num = '${regNo}'
    `
  }
    }
  
    else if (type == "SAVEUTMESTATUS") {
      sql = `SELECT
    reg_num, lastname, firstname, middlename, sex, state, utme_aggregate, department, lga, subject_1, subject_1_score, subject_2,
    subject_2_score, subject_3, subject_3_score, english_score, school, student_type, recommendation, qualified
    FROM ${tableName} WHERE reg_num = '${regNo}'
    `
    }
    else if (type == "DE") {
      sql = `SELECT reg_num, fullname, sex, state, department, lga, phone
    FROM ${tableName} WHERE reg_num = '${regNo}'`;
  
    }
  
    else if (type == "PRE") {
      sql = `SELECT
    reg_num, fullname, jamb_score,prescience_no, subjects,best_of_four,sex, state,department_admitted, average,
    phone,email,bio_data,added, edited
  
    FROM ${tableName} WHERE reg_num = '${regNo}'
    `
    }
    else if (type == "JUPEB") {
      sql = `SELECT
    reg_num,jupeb_no, fullname, subjects,total_score,first_choice,second_choice, remarks,bio_data,added, edited
     FROM ${tableName} WHERE reg_num = '${regNo}'
    `
  
    }
    else if (type == "SUP") {
      sql = `SELECT id,
    reg_num,preferred_course,source,added,edited
    FROM ${tableName} WHERE reg_num = '${regNo}'
    `
  
    }
    else if (type == "POSTUTME") {
      sql = `SELECT
    reg_num,utme_score,putme_score,calculated_average,added, edited
    FROM ${tableName} WHERE reg_num = '${regNo}'
    `
  
    }
  
    // console.log(sql)
    const result = await doQuery(sql)
    return result
  
  }



app.listen(port, ()=> {
    console.log(`listening on port ${port}`)
})


// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(fileUpload());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, content-type,accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');

  next();
});
// makeConnection()
app.get('/', (req, res, next) => {
    // makeConnection()
    // closeConnection()
    res.status(200).json({
      statusMessage: "Success, this works node"
    });
  
  })
const tableName = `uaras_saved_utme_candidate_status`
app.route('/api/check-sent-chuka').get(onWhatIsSent)
async function onWhatIsSent(req, res) {
    // makeConnection()

  const type = "SAVEUTMESTATUS"
  var message = ""
  requestCount += 1
  const regNo = req.query.regNo
  var projectM_temp = []
  await getStudentRegistrationInfo(regNo, type, projectM_temp)
  const answer = projectM_temp.length > 0 ? 1 : 0
//   console.log('answer::', answer)
//   closeConnection()
  if (answer) {

      res.status(200).json({
        studentRecord: projectM_temp,
        message: "student record found",
        requestcount: requestCount,

        status: 200
      });
    // }

  }
  else {
    res.status(202).json({
      studentRecord: projectM_temp,
      message: "student record not found, change to us",
      requestcount: requestCount,

      status: 202
    });
  }

}

async function getStudentRegistrationInfo(regNo, type, projectM) {
    // else {
      let toSend2 = {}
      let type2 = 0
      const r1 = await recordsFromATableGrab(type,regNo,tableName,true)
      console.log('...retrieved student record', r1)
      const toSend = r1.length < 1  ? undefined : r1
      if (type === "DE") {
        
      }
      else {
        try {
  
            toSend2 = {
            reg_num: toSend[0]['reg_num'],
            lastname: toSend[0]['lastname'],
            firstname: toSend[0]['firstname'],
            middlename: toSend[0]['middlename'],
            sex: toSend[0]['sex'],
            state: toSend[0]['state'],
            utme_aggregate: toSend[0]['utme_aggregate'],
            department: toSend[0]['department'],
            faculty: "",
            lga: toSend[0]['lga'],
            subject_1: toSend[0]['subject_1'],
            subject_1_score: toSend[0]['subject_1_score'],
            subject_2: toSend[0]['subject_2'],
            subject_2_score: toSend[0]['subject_2_score'],
            subject_3: toSend[0]['subject_3'],
            subject_3_score: toSend[0]['subject_3_score'],
            english_score: toSend[0]['english_score'],
            school:toSend[0]['school'],
            student_type: toSend[0]['student_type'] === 1 ? "UTME" : "DE",
            recommendation: toSend[0]['recommendation'],
            qualified: toSend[0]['qualified']
  
  
          }
            projectM.push(toSend2)
  
            return toSend2
          }
          
          catch (error) {
  
          console.log("Error, Failed to retrieve record")
          return error
          }
  
      }
  
        // return toSend2
  
  }







function exitHandler(options, err) {
    connection.end();
    if (options.cleanup)
        console.log('clean');
    if (err)
        console.log(err.stack);
    if (options.exit)
        process.exit();
}

//do something when app is closing
process.on('exit', exitHandler.bind(null, {cleanup: true}));


console.log("running..")
