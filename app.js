const express = require("express");
const app = express();
const mysql = require("mysql2");
const cors = require("cors");

app.use(express.json());
app.use(cors());

let db = null;
const initializeDbAndServer = async () => {
  try {
    db = mysql.createConnection({
      host: "localhost",
      user: "vaishu",
      password: "Bharu@96",
      database: "example_project_backend",
      insecureAuth: true,
    });
    const port = 3004
    app.listen(port, () => {
      console.log(`app listening at ${3004}...`); 
    });
    db.connect(function (err) {
      if (err) throw err;
      console.log("Conected!");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();


app.post("/example_signup", (request, response) => {
  const userDetails = request.body;
  const { name, mobileNumber, email, password } = userDetails;
  const create_user_table = `
        CREATE TABLE IF NOT EXISTS  example_user_table (
            admin_id INTEGER NOT NULL AUTO_INCREMENT,
            name VARCHAR (1000),
            mobile_number VARCHAR (1000),
            email VARCHAR (1000),
            password VARCHAR (5000),
            PRIMARY KEY (admin_id)
        );`;

  db.query(create_user_table, (err, result) => {
    if (err) {
      response.status(500);
      console.log("52", err)
      return;
    }
    const insert_user_details = `
           INSERT INTO 
                example_user_table (name,  mobile_number, email, password)
            values (
                "${name}", "${mobileNumber}", "${email}", "${password}"
            ); `;

    db.query(insert_user_details, (err, result) => {
      if (err) {
        response.status(500).json("Enter Valid Details");
        console.log("68", err)
        return;
      }
      response.status(200).json(result);
      console.log("72", result) 
    });
  });
});


//login API
app.post("/login", (request, response) => {
  const loginDetails = request.body;
  const { mobileNumber, password } = loginDetails;

  const get_login_details_query = `
        SELECT 
            *
        FROM 
            example_user_table
        WHERE
             mobile_number = "${mobileNumber}"
             AND password = "${password}";`;

  db.query(get_login_details_query, (err, result) => {
    if (err) {
      response.status(500).json("Cannot Get Details");
      console.log("95", err)
      return;
    } else if (
      result.length !== 0 &&
      result[0].mobile_number === mobileNumber &&
      result[0].password === password
    ) {
    //   const payload = { mobileNumber: mobileNumber };
    //   const jwtToken = jwt.sign(payload, "oaapmcntholamc");
      response.status(200).json(result);
      console.log("105", result)
    } else if (result.length == 0) {
      response.status(500).json("Enter Valid Mobile Number and Password");
      console.log("108err")
    }
  });
});


