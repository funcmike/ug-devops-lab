const express = require('express');
const app = express();

const { v4: uuidv4 } = require('uuid');

const appId = uuidv4();


const redis = require("redis");
const client = redis.createClient();

client.on("error", function(error) {
  console.error(error);
});

client.set(appId, "Hello from backend app", redis.print);

app.get('/', (req, resp) => {
    client.get(appId, function(err, res) {
        resp.send(`[${appId} ${res}]`)
      });
})

const port = 5000;

app.listen(port, err => {
    console.log(`Listening on port ${port}`);
})