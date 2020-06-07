const keys = require('./keys')
const express = require('express');
const app = express();

console.log(keys);

const { v4: uuidv4 } = require('uuid');

const appId = uuidv4();


const redis = require("redis");
const client = redis.createClient(keys.redisPort, keys.redisHost);

client.on("error", function(error) {
  console.error(error);
});

client.set(appId, "Hello from backend app", redis.print);

const { Pool } = require('pg');

const pgClient = new Pool({
    host: keys.pgHost,
    port: keys.pgPort,
    user: keys.pgUser,
    password: keys.pgPass,
    database: keys.pgDB,
})

pgClient.on('error', () => console.log('better use mysql next time'))


pgClient
    .query('CREATE TABLE IF NOT EXISTS uuids (uuid VARCHAR (100) UNIQUE NOT NULL)')
    .catch(err => console.log('no table for u', err));


app.get('/', (req, resp) => {
    client.get(appId, function(err, res) {
        resp.send(`[${appId} ${res}]`)
      });
    const text = 'INSERT INTO uuids(uuid) VALUES($1) RETURNING *'
    const values = [appId]
    
    pgClient.query(text, values, (err, res) => {
      if (err) {
        console.log('insert fail', err.stack)
      } else {
        console.log(res.rows[0])
      }
    })
})

const port = 5000;

app.listen(port, err => {
    console.log(`Listening on port ${port}`);
})