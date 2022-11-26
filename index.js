import express from 'express'
import fetch from 'node-fetch'
import cors from 'cors'

const PORT = process.env.PORT || 5000
var app = express();
app.use(express.json());
app.use(cors());

var URL = "https://white-vulpes.hasura.app/v1/graphql";

app.post('/sendMail', async (req, res) => {
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

var fetcher = async (query, variables) => {
    var result = await fetch(URL,{method: 'POST',headers: {'content-type':'application/json', 'x-hasura-admin-secret':'SimpleLoginPageDuhh'},body: JSON.stringify({query:query, variables:variables})}).then((response) => response.json()).then((user) => { return user;});
    return result;
}

app.listen(PORT, () => {console.log(`Server Running on ${PORT}`)})