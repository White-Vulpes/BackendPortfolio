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
    sendMail(req.body.event.data.new.mail, req.body.event.data.new.first_name, req.body.event.data.new.last_name, req.body.event.data.new.comments)
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

async function sendMail(mailAdd, first_name, last_name, comments) {
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
      to: 'aayush.02.parmar@gmail.com',
      subject: 'Hello from ' + first_name + " " + last_name,
      text: first_name + " " + last_name + " says, \n" + comments + "\n\n\nMail Address: " + mailAdd,
      html: `<div><img id="image" src="data:image/png;base64,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"></div>`,
    };

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    return error;
  }
}

app.listen(PORT, () => {console.log(`Server Running on ${PORT}`)})