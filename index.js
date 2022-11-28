import express from 'express'
import fetch from 'node-fetch'
import cors from 'cors'
import nodemailer from 'nodemailer'
import { google } from 'googleapis'

const CLIENT_ID = '922065204351-nkruqhuidq377ih0rbvqnuni4igbqdr1.apps.googleusercontent.com';
const CLEINT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04UIOV3HPXil8CgYIARAAGAQSNwF-L9IrrRx93O-lO0LIMFTjly-MF0dmdfIRMNZ5S6yP6aEeKokJP-mlqzJdBomzbfQvoAFrKQE';

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLEINT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const PORT = process.env.PORT || 5000
var app = express();
app.use(express.json());
app.use(cors());

var URL = "https://white-vulpes.hasura.app/v1/graphql";

app.post('/mailRequest', async (req, res) => {
  let query = `mutation MyMutation($comments: String = "", $first_name: String = "", $last_name: String = "", $mail: String = "") {
                    insert_mail_records_one(object: {comments: $comments, first_name: $first_name, last_name: $last_name, mail: $mail}) {
                    id
                    }
                }`;
  let variables = {
    comments: req.body.query.comments,
    first_name: req.body.query.first_name,
    last_name: req.body.query.last_name,
    mail: req.body.query.mail
  }

  let result = await fetcher(query, variables);
  try{
    if(result.data.insert_mail_records_one.id != null) res.status(200).json({status: "Sent"});
    else if(result.errors != null) res.status(400).json({error: result.errors[0].message})
  }catch(e){
    res.status(400).json({errors: e.message});
  }
})

app.post('/sendMail', async (req, res) => {
  if(req.body.event != null){
    sendMail(req.body.event.data.new.mail)
    .then((result) => res.status(200).json(result))
    .catch((error) => res.status(400).json(error));
  }
  else{
    res.status(400).json({message: "mail not found"});
  }
})

var fetcher = async (query, variables) => {
    var result = await fetch(URL,{method: 'POST',headers: {'content-type':'application/json', 'x-hasura-admin-secret':'SimpleLoginPageDuhh'},body: JSON.stringify({query:query, variables:variables})}).then((response) => response.json()).then((user) => { return user;});
    return result;
}

async function sendMail(mailAdd) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'aayush.02.parmar@gmail.com',
        clientId: CLIENT_ID,
        clientSecret: CLEINT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: 'aayush.02.parmar@gmail.com',
      to: mailAdd,
      subject: 'Hello from ' + mailAdd,
      text: "Thankyou for Contacting me. I will get back to you in sometime",
      html: `<p>Thankyou for Contacting me. I will get back to you in sometime<p>`,
    };

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    return error;
  }
}

app.listen(PORT, () => {console.log(`Server Running on ${PORT}`)})