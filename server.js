const redis = require('redis')
const express = require('express');
const timers = require("timers");

const app = express()

app.use(express.json())

//CONSTANTES
const gitHubApiPath = "https://api.github.com/users/Micheeodd";
const endpoint = "/github"
const dataKey = "githubDatas"
const port = 8000
let datas = null


//Redis
let client =  redis.createClient()



app.get(endpoint, async (req, res) => {
    //const apiCalls = await client.get('callLimit') | 0;

    let start = performance.now();

    datas = await client.get(dataKey);
    let result = null;
    let fromCache = false

/*    if(apiCalls >= 10) {
        res.status(429).send('Too many request');
        return
    }*/

    //await client.incr('callLimit');
   if(!datas) {
     const api = await fetch(gitHubApiPath)
       result = await api.json()

       //Mettre en cache la réponse dans redis
       //await client.set(dataKey, JSON.stringify(datas),{EX:5}) avec un TTL: time to leave
       await client.set(dataKey, JSON.stringify(result))

   }else {
       fromCache = true;
       result= JSON.parse(datas)
   }

   let timeTaken = performance.now() - start

    res.status(200).send({
        timeTaken,
        result
    })


})


app.get('/top3', async (req, res) => {
    //Renvois les 10 meilleurs joueur classés selon leur score
})

app.post('/player', async (req, res) => {
    //Ajouter un joueur
    const label = "player_score"
    const {name, score} = req.body
    await client.zAdd(label, {score, value : name})
})

app.listen(port, async () => {
    await client.connect()
    console.log(`Le server tourne à l'adresse suivante: http://localhost:${port}`)
})



