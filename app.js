require("dotenv").config();
const express = require("express");
const app = express();
const mysql = require("mysql2");
const cors = require("cors");


app.use(express.json());
app.use(cors());

let db
const initializeDbAndServer = async () => {
  try {
    // db = mysql.createConnection({
    //   host: process.env.DB_HOST,
    //   user: process.env.DB_USER,
    //   password: process.env.DB_PASSWORD,
    //   database: process.env.DB_NAME,
    //   insecureAuth: true,
    // });

  db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
   
    const port = process.env.DB_PORT || 3004;
    app.listen(port, () => {
      console.log(`app listening at ${port}...`);
    });
    // db.connect(function (err) {
    //   if (err) throw err;
    //   console.log("Conected!"); 
    // });
    db.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("✅ Database connected successfully!");
    connection.release();
  }
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
      console.log("52", err);
      return;
    }
    const insert_user_details = `
           INSERT INTO 
                example_user_table (name,  mobile_number, email, password)
            values (
                ?, ?, ?, ? 
            ); `;

    db.query(insert_user_details,[name, mobileNumber, email, password], (err, result) => {
      if (err) {
        response.status(500).json("Enter Valid Details");
        console.log("68", err);
        return;
      }
      response.status(200).json(result);
      console.log("72", result);
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
      console.log("95", err);
      return;
    } else if (
      result.length !== 0 &&
      result[0].mobile_number === mobileNumber &&
      result[0].password === password
    ) {
      response.status(200).json(result);
      console.log("105", result);
    } else if (result.length == 0) {
      response.status(500).json("Enter Valid Mobile Number and Password");
      console.log("108err");
    }
  });
});
