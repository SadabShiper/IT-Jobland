const express = require("express");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bodyParser = require("body-parser");
const NodeCache = require("node-cache");
const dbConnection = require("./dbConnection");
const path = require("path");
const bcrypt = require("bcrypt");
const app = express();
const mysql = require('mysql2/promise');
const fileUpload = require('express-fileupload');


// const cors = require('cors');

// app.use(cors());
app.use(fileUpload());
app.use(express.static(__dirname)); // Serve static files from the current directory
app.use(express.static('public')); // Serve static files from the current directory
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Parse JSON requests


const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: 'project',
};

let globalEmail = null;
let globalEmailJobseeker = null;


// Create a new instance of NodeCache
const otpCache = new NodeCache();

const otpData = {
    forgot: "",
    signup: ""
};

let storedOTP_forgot; // Global variable to store OTP for forgot password flow
let storedOTP_signup; // Global variable to store OTP for signup flow

// JOB SEEKER
app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "signup.html"));
});
app.get("/signin", (req, res) => {
    res.sendFile(path.join(__dirname, "signin.html"));
});
app.get("/forgot-password", (req, res) => {
    res.sendFile(path.join(__dirname, "forgot-password.html"));
});
app.get("/verify-otp", (req, res) => {
    res.sendFile(path.join(__dirname, "verify-otp.html"));
});
app.get("/reset-password", (req, res) => {
    res.sendFile(path.join(__dirname, "resetpassword.html"));
});
app.get("/verify-otp-signup", (req, res) => {
    res.sendFile(path.join(__dirname, "verify-otp-signup.html"));
});
app.get("/profile", (req, res) => {
    res.sendFile(path.join(__dirname, "profile.html"));
});

// HOME
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "first_page.html"));
});


// ADMIN
app.get("/admin-signin", (req, res) => {
    res.sendFile(path.join(__dirname, "admin-signin.html"));
});
app.get("/admin-profile", (req, res) => {
    res.sendFile(path.join(__dirname, "admin-profile.html"));
});

// EMPLOYEE
app.get("/employee-signup", (req, res) => {
    res.sendFile(path.join(__dirname, "employee-signup.html"));
});
app.get("/employee-signin", (req, res) => {
    res.sendFile(path.join(__dirname, "employee-signin.html"));
});
app.get("/employee-forgot-password", (req, res) => {
    res.sendFile(path.join(__dirname, "employee-forgot-password.html"));
});
app.get("/employee-verify-otp", (req, res) => {
    res.sendFile(path.join(__dirname, "employee-verify-otp.html"));
});
app.get("/employee-resetpassword", (req, res) => {
    res.sendFile(path.join(__dirname, "employee-resetpassword.html"));
});
app.get("/employee-verify-otp-signup", (req, res) => {
    res.sendFile(path.join(__dirname, "employee-verify-otp-signup.html"));
});
app.get("/employee-profile", (req, res) => {
    res.sendFile(path.join(__dirname, "employee-profile.html"));
});


// EMPLOYER

app.get("/employer-signup", (req, res) => {
    res.sendFile(path.join(__dirname, "employer-signup.html"));
});
app.get("/employer-signin", (req, res) => {
    res.sendFile(path.join(__dirname, "employer-signin.html"));
});
app.get("/employer-forgot-password", (req, res) => {
    res.sendFile(path.join(__dirname, "employer-forgot-password.html"));
});
app.get("/employer-verify-otp", (req, res) => {
    res.sendFile(path.join(__dirname, "employer-verify-otp.html"));
});
app.get("/employer-resetpassword", (req, res) => {
    res.sendFile(path.join(__dirname, "employer-resetpassword.html"));
});
app.get("/employer-verify-otp-signup", (req, res) => {
    res.sendFile(path.join(__dirname, "employer-verify-otp-signup.html"));
});
app.get("/employer-profile", (req, res) => {
    res.sendFile(path.join(__dirname, "employer-profile.html"));
});


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "captainpriceb6goingdark@gmail.com",
        pass: "muaf txuf vnvl ftev"
    }
});

function generateOTP() {
    return crypto.randomBytes(3).toString('hex').toUpperCase();
}

let EMAIL;
app.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    EMAIL = req.body;
    console.log(email);
    storedOTP_forgot = generateOTP();
    otpData.forgot = storedOTP_forgot; // Store OTP for forgot password flow

    try {
        const [user] = await dbConnection.query("SELECT * FROM users WHERE email = ?", [email]);

        if (user && user.length > 0) {
            const mailOptions = {
                from: "captainpriceb6goingdark@gmail.com",
                to: email,
                subject: "Password Reset OTP",
                text: `Your OTP for password reset is: ${storedOTP_forgot}`
            };

            // Send OTP to user's email
            await transporter.sendMail(mailOptions);
            res.send(`
            <script>
            window.location.href = '/verify-otp.html';
            </script>
            `);
        } else {
            res.status(404).send("User not found with this email.");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});
app.post("/reset-password", async (req, res) => {
    const { newPassword } = req.body;
    // Extract email from the EMAIL object
    const email = EMAIL.email;

    console.log(req.body);
    try {
        // Update the user's password in the database
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updateQuery = "UPDATE users SET password = ? WHERE email = ?";
        await dbConnection.query(updateQuery, [hashedPassword, email]);

        
        res.status(200).send("Password reset successful!");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/verify-otp", async (req, res) => {
    console.log("verify-otp");
    const { otp } = req.body;
    
    if (otp && otp.toString() === otpData.forgot.toString()) {
        console.log("Correct OTP for forgot password flow");
        return res.redirect('/reset-password');
    } else {
        return res.status(400).send("Incorrect OTP. Please try again.");
    }
});

app.post("/verify-otp-signup", async (req, res) => {
    console.log("verify-otp-signup");
    const { otp } = req.body;
    
    if (otp && otp.toString() === otpData.signup.toString()) {
       
        console.log("Correct OTP for signup flow");
        return res.redirect('/signin');
    } else {
        return res.status(400).send("Incorrect OTP. Please try again.");
    }
});



app.post("/signup", async (req, res) => {
    const { job_seeker_email, job_seeker_password } = req.body;
    console.log('Received password:', job_seeker_password); 
    console.log('Received email:', job_seeker_email); 
    const hashedPassword = await bcrypt.hash(job_seeker_password, 10); // Hash the password with a salt of 10 rounds
    storedOTP_signup = generateOTP(); // Store OTP for signup flow
    otpData.signup = storedOTP_signup; // Store OTP for signup flow
    
    try {
        // const salt = await bcrypt.genSalt(10);
        // const hashedPassword = await bcrypt.hash(password, salt);
        const [existingUser] = await dbConnection.query("SELECT * FROM jobseeker WHERE job_seeker_email = ?", [job_seeker_email]);
        
        if (existingUser.length > 0) {
            return res.status(400).send("User with this email already exists.");
        }
        
       
        await dbConnection.query("INSERT INTO jobseeker (job_seeker_email, job_seeker_password, otp) VALUES (?, ?, ?)", [job_seeker_email, hashedPassword, storedOTP_signup]);
        
        const mailOptions = {
            from: "captainpriceb6goingdark@gmail.com",
            to: job_seeker_email,
            subject: "Signup OTP",
            text: `Your OTP for password reset is: ${storedOTP_signup}`
        };
        
        // Send OTP to user's email
        await transporter.sendMail(mailOptions);
        
        res.send(`
        <script>
        window.location.href = '/verify-otp-signup.html';
        </script>
        `);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


// app.post("/employer-signup", async (req, res) => {
//     const { email, password, company_name, company_code, designation } = req.body;
//     const hashedPassword = await bcrypt.hash(password, 10);
//     storedOTP_signup = generateOTP();
//     otpData.signup = storedOTP_signup;

//     try {
//         const [existingUser] = await dbConnection.query("SELECT * FROM users WHERE email = ?", [email]);

//         if (existingUser.length > 0) {
//             return res.status(400).send("User with this email already exists.");
//         }

//         // Verify if company_code and company_name match in the company table
//         // const [matchingCompany] = await dbConnection.query("SELECT * FROM company WHERE TRIM(company_name) = ? AND TRIM(company_code) = ?", [company_name, company_code]);

//         // if (matchingCompany.length === 0) {
//         //     return res.status(400).send("Invalid company code or company name. Please check and try again.");
//         // }

//         await dbConnection.query("INSERT INTO users (email, employer_password, otp, company_name, company_code, designation) VALUES (?, ?, ?, ?, ?, ?)", [email, hashedPassword, storedOTP_signup, company_name, company_code, designation]);

//         const mailOptions = {
//             from: "captainpriceb6goingdark@gmail.com",
//             to: email,
//             subject: "Signup OTP",
//             text: `Your OTP for password reset is: ${storedOTP_signup}`
//         };

//         await transporter.sendMail(mailOptions);

//         res.send(`
//         <script>
//         window.location.href = '/verify-otp-signup.html';
//         </script>
//         `);
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Internal Server Error");
//     }
// });


app.post("/signin", async (req, res) => {
    const { job_seeker_email, job_seeker_password } = req.body;
    EMAIL = job_seeker_email;
    console.log(job_seeker_email);
    try {
        // Check if the provided email and password match any user in the database
        const [user] = await dbConnection.query("SELECT * FROM jobseeker WHERE job_seeker_email = ?", [job_seeker_email]);

        if (user.length > 0) {
            const isPasswordValid = await bcrypt.compare(job_seeker_password, user[0].job_seeker_password);
            if (isPasswordValid) {
                // Sign-in successful
                globalEmailJobseeker = job_seeker_email;
                res.send(`
                <script>
                window.location.href = '/jobseekerFirstPage.html';
                </script>
                `);

            } else {
                // Sign-in failed (invalid password)
                res.status(401).send("Invalid password.");
            }
        } else {
            // Sign-in failed (invalid email)
            res.status(401).send("Invalid email.");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


// app.post("/signin", async (req, res) => {
//     const { email, password } = req.body; // Change "employer_password" to "password"
//     EMAIL = email;
//     console.log(email);
//     try {
//         // Check if the provided email matches any user in the database
//         const [user] = await dbConnection.query("SELECT * FROM users WHERE email = ?", [email]);

//         if (user.length > 0) {
//             // Get the hashed password from the database
//             const hashedPassword = user[0].employer_password;
            
//             // Compare the provided password with the hashed password
//             const isPasswordValid = await bcrypt.compare(password, hashedPassword);

//             if (isPasswordValid) {
//                 // Sign-in successful
//                 // res.send(`
//                 // <script>
//                 // window.location.href = '/profile.html';
//                 // </script>
                
//                 // `);

//                 return res.redirect('/employerFirstPage.html');

//             } else {
//                 // Sign-in failed (invalid password)
//                 res.status(401).send("Invalid password.");
//             }
//         } else {
//             // Sign-in failed (invalid email)
//             res.status(401).send("Invalid email.");
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Internal Server Error");
//     }
// });



app.post("/admin-signin", async (req, res) => {
    const { email, password } = req.body;
    EMAIL = email;
    console.log(email);
    console.log(password);
    try {
        // Check if the provided email and password match any user in the database
        const [user] = await dbConnection.query("SELECT * FROM admin WHERE email = ?", [email]);
        if (user.length > 0) {
            console.log(password);
            console.log(user[0].password);
            const isPasswordValid = (password == user[0].password) ;
            console.log(isPasswordValid);
            if (isPasswordValid) {
                
                res.send(`
                <script>
                window.location.href = '/admin-profile.html';
                </script>
                `);

            } else {
             
                res.status(401).send("Invalid password.");
            }
        } else {
           
            res.status(401).send("Invalid email.");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});



app.post("/employee-signin", async (req, res) => {
    const { email, password } = req.body;
    EMAIL = email;
    console.log(email);
    console.log(password);
    try {
        // Check if the provided email and password match any user in the database
        const [user] = await dbConnection.query("SELECT * FROM users WHERE email = ?", [email]);
        if (user.length > 0) {
            console.log(password);
            console.log(user[0].password);
            const isPasswordValid = await bcrypt.compare(password, user[0].password);
            console.log(isPasswordValid);
            if (isPasswordValid) {
                // Sign-in successful
                res.send(`
                <script>
                window.location.href = '/employee-profile.html';
                </script>
                `);

            } else {
               
                res.status(401).send("Invalid password.");
            }
        } else {
          
            res.status(401).send("Invalid email.");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});
app.post("/employee-signup", async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); 
    storedOTP_signup = generateOTP(); 
    otpData.signup = storedOTP_signup; 
    
    try {
        const [existingUser] = await dbConnection.query("SELECT * FROM users WHERE email = ?", [email]);
        
        if (existingUser.length > 0) {
            return res.status(400).send("User with this email already exists.");
        }
        
       
        await dbConnection.query("INSERT INTO users (email, password, otp) VALUES (?, ?, ?)", [email, hashedPassword, storedOTP_signup]);
        
        const mailOptions = {
            from: "captainpriceb6goingdark@gmail.com",
            to: email,
            subject: "Signup OTP",
            text: `Your OTP for password reset is: ${storedOTP_signup}`
        };
        
        // Send OTP to user's email
        await transporter.sendMail(mailOptions);
        
        res.send(`
        <script>
        window.location.href = '/employee-verify-otp-signup.html';
        </script>
        `);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});
app.post("/employee-verify-otp-signup", async (req, res) => {
    console.log("verify-otp-signup");
    const { otp } = req.body;
    
    if (otp && otp.toString() === otpData.signup.toString()) {
        
        console.log("Correct OTP for signup flow");
        return res.redirect('/employee-signin');
    } else {
   
        return res.status(400).send("Incorrect OTP. Please try again.");
    }
});
app.post("/employee-verify-otp", async (req, res) => {
    console.log("verify-otp");
    const { otp } = req.body;
    
    if (otp && otp.toString() === otpData.forgot.toString()) {
        
        console.log("Correct OTP for forgot password flow");
        return res.redirect('/employee-resetpassword');
    } else {
       
        return res.status(400).send("Incorrect OTP. Please try again.");
    }
});
app.post("/employee-forgot-password", async (req, res) => {
    const { email } = req.body;
    EMAIL = req.body;
    console.log(email);
    storedOTP_forgot = generateOTP();
    otpData.forgot = storedOTP_forgot; 

    try {
        const [user] = await dbConnection.query("SELECT * FROM users WHERE email = ?", [email]);

        if (user && user.length > 0) {
            const mailOptions = {
                from: "captainpriceb6goingdark@gmail.com",
                to: email,
                subject: "Password Reset OTP",
                text: `Your OTP for password reset is: ${storedOTP_forgot}`
            };

            // Send OTP to user's email
            await transporter.sendMail(mailOptions);
            res.send(`
            <script>
            window.location.href = '/employee-verify-otp.html';
            </script>
            `);
        } else {
            res.status(404).send("User not found with this email.");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});
app.post("/employee-resetpassword", async (req, res) => {
    const { newPassword } = req.body;
    // Extract email from the EMAIL object
    const email = EMAIL.email;

    console.log(req.body);
    try {
       
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updateQuery = "UPDATE users SET password = ? WHERE email = ?";
        await dbConnection.query(updateQuery, [hashedPassword, email]);

       
        res.status(200).send("Password reset successful!");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});



app.post("/employer-signup", async (req, res) => {
    const { email, password, company_name, company_code, designation } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    storedOTP_signup = generateOTP();
    otpData.signup = storedOTP_signup;

    try {
        const [existingUser] = await dbConnection.query("SELECT * FROM users WHERE email = ?", [email]);

        if (existingUser.length > 0) {
            return res.status(400).send("User with this email already exists.");
        }

        // Verify if company_code and company_name match in the company table
        const [matchingCompany] = await dbConnection.query("SELECT * FROM company WHERE TRIM(company_name) = ? AND TRIM(company_code) = ?", [company_name, company_code]);

        console.log("company_name:", company_name);
        console.log("company_code:", company_code);


        if (matchingCompany.length === 0) {
            return res.status(400).send("Invalid company code or company name. Please check and try again.");
        }

        await dbConnection.query("INSERT INTO users (email, password, otp, company_name, company_code, designation) VALUES (?, ?, ?, ?, ?, ?)", [email, hashedPassword, storedOTP_signup, company_name, company_code, designation]);

        const mailOptions = {
            from: "captainpriceb6goingdark@gmail.com",
            to: email,
            subject: "Signup OTP",
            text: `Your OTP for password reset is: ${storedOTP_signup}`
        };

        await transporter.sendMail(mailOptions);

        res.send(`
        <script>
        window.location.href = '/employer-verify-otp-signup';
        </script>
        `);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/employer-signin", async (req, res) => {
    const { email, password } = req.body;
    EMAIL = email;
    console.log(email);
    console.log(password);
    try {
        // Check if the provided email and password match any user in the database
        const [user] = await dbConnection.query("SELECT * FROM users WHERE email = ?", [email]);
        if (user.length > 0) {
            console.log(password);
            console.log(user[0].password);
            const isPasswordValid = await bcrypt.compare(password, user[0].password);
            console.log(isPasswordValid);
            if (isPasswordValid) {
             
                globalEmail = email;
                res.send(`
                <script>
                window.location.href = '/employerFirstPage.html';
                </script>
                `);

            } else {
                
                res.status(401).send("Invalid password.");
            }
        } else {
           
            res.status(401).send("Invalid email.");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});



app.post("/employer-verify-otp-signup", async (req, res) => {
    console.log("employer-verify-otp-signup");
    const { otp } = req.body;
    
    if (otp && otp.toString() === otpData.signup.toString()) {
       
        console.log("Correct OTP for signup flow");
        return res.redirect('/employer-signin');
    } else {
        
        return res.status(400).send("Incorrect OTP. Please try again.");
    }
});
app.post("/employer-verify-otp", async (req, res) => {
    console.log("verify-otp");
    const { otp } = req.body;
    
    if (otp && otp.toString() === otpData.forgot.toString()) {
        
        console.log("Correct OTP for forgot password flow");
        return res.redirect('/employer-resetpassword');
    } else {
    
        return res.status(400).send("Incorrect OTP. Please try again.");
    }
});
app.post("/employer-forgot-password", async (req, res) => {
    const { email } = req.body;
    EMAIL = req.body;
    console.log(email);
    storedOTP_forgot = generateOTP();
    otpData.forgot = storedOTP_forgot; // Store OTP for forgot password flow

    try {
        const [user] = await dbConnection.query("SELECT * FROM users WHERE email = ?", [email]);

        if (user && user.length > 0) {
            const mailOptions = {
                from: "captainpriceb6goingdark@gmail.com",
                to: email,
                subject: "Password Reset OTP",
                text: `Your OTP for password reset is: ${storedOTP_forgot}`
            };

            // Send OTP to user's email
            await transporter.sendMail(mailOptions);
            res.send(`
            <script>
            window.location.href = '/employer-verify-otp.html';
            </script>
            `);
        } else {
            res.status(404).send("User not found with this email.");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});
app.post("/employer-resetpassword", async (req, res) => {
    const { newPassword } = req.body;
    // Extract email from the EMAIL object
    const email = EMAIL.email;

    console.log(req.body);
    try {
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updateQuery = "UPDATE users SET password = ? WHERE email = ?";
        await dbConnection.query(updateQuery, [hashedPassword, email]);
     
        res.status(200).send("Password reset successful!");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});



app.post("/jobPost", (req, res) => {
    const { jobTitle, jobDescription, location, qualification, salary, companyName } = req.body;
    //const employerEmail = req.session.email;
  
   
    const insertQuery = "INSERT INTO jobpost (job_title, job_description, location, qualification, salary, company_name,employer_email) VALUES (?, ?, ?, ?, ?, ?,?)";
  
   
    dbConnection.query(insertQuery, [jobTitle, jobDescription, location, qualification, salary, companyName,globalEmail], (err, result) => {
      if (err) {
        console.error("Error inserting data into the jobpost table:", err);
        res.status(500).send("Internal Server Error");
      } else {
        console.log("Job offer posted successfully!");
        res.send("Job offer posted successfully!");
      }
    });
  });


//   app.get('/getJobOffers', (req, res) => {
//     // Query the database to retrieve job offers
//     dbConnection.query("SELECT company_name,job_title, job_description, location,  qualification, salary FROM jobpost", (err, jobOffers) => {
//         if (err) {
//             console.error('Error retrieving job offers:', err);
//             res.status(500).json({ error: 'Internal Server Error' });
//         } else {
//             res.json(jobOffers);
//         }
//     });
// });


app.get('/getJobOffers', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig); 
        const [jobOffers] = await connection.execute("SELECT job_post_id,company_name,job_title, job_description, location,  qualification, salary FROM jobpost");

       
        connection.end();

        res.json(jobOffers);
    } catch (error) {
        console.error('Error retrieving job offers:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.post('/apply', async (req, res) => {
    try {
        const job_offer_id = req.body.job_post_id; 

        
        const resume = req.files.resume;

        // Check if the resume is in PDF format
        if (!resume || resume.mimetype !== 'application/pdf') {
            return res.status(400).json({ error: 'Invalid file format. Please upload a PDF file.' });
        }

        const uploadDate = new Date();

        
        const insertQuery = 'INSERT INTO resumes (job_seeker_email, job_post_id, CV, upload_date) VALUES (?, ?, ?, ?)';
        const values = [globalEmailJobseeker, job_offer_id, 'path_to_uploaded_file.pdf', uploadDate]; 

        await dbConnection.query(insertQuery, values);

        return res.status(200).json({ success: 'Resume uploaded successfully.' });
    } catch (error) {
        console.error('Error handling resume upload:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});



app.get('/getCV', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig); // Establish a new database connection

        // Query the database to retrieve job offers
        
        const [CVs] = await connection.execute(`
            SELECT R.CV,R.upload_date,R.job_seeker_email
            FROM Resumes R
            JOIN jobpost JP ON R.job_post_id = JP.job_post_id
            JOIN users E ON JP.employer_email = E.email
            WHERE E.email = ?;
        `, [globalEmail]);
        
        // Release the connection when done
        connection.end();

        res.json(CVs);
        // if (CVs.length > 0) {
        //     // Set the content type as 'application/pdf'
        //     res.contentType('application/pdf');
        //     res.send(CVs[0].CV); // Send the CV binary data
        // } else {
        //     res.status(404).send('CV not found');
        // }
    } catch (error) {
        console.error('Error retrieving CVs:', error);
        //res.status(500).json({ error: 'Internal Server Error' });
    }
});



app.listen(7000, () => {
    console.log("Server started on port 7000");
});




