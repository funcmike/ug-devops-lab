const keys = require('./keys')
const express = require('express');
const cors = require('cors');
const redis = require('redis');
const process = require('process');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


console.log(keys);


const { Pool } = require('pg');
const pgClient = new Pool({
    host: keys.pgHost,
    port: keys.pgPort,
    database: keys.pgDb,
    user: keys.pgUser,
    password: keys.pgPass,
})

pgClient.on('error', () => console.log('wtf? better use mysql'))


pgClient
    .query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch(err => console.log(err));

const client = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
});

function gcd(x, y) {
    if ((typeof x !== 'number') || (typeof y !== 'number'))
        return 0;
    x = Math.abs(x);
    y = Math.abs(y);
    while (y) {
        var t = y;
        y = x % y;
        x = t;
    }
    return x;
}

app.get('/history', (req, res) => {
    {
        pgClient
        .query('SELECT number from values')
        .then(results => {
            console.log(results.rows) // ['brianc']
            res.send(results.rows);
          })
        .catch(err => console.log(err));
    }

});

app.post('/', (req, res) => {
    {
        console.log("input:", req.body);
        var x = parseInt(req.body.x);
        var y = parseInt(req.body.y);
        var key = x + "-" + y;
        if (y > x) {
            key = y + "-" + x
        }
        console.log("key:", key);
        client.get(key, (err, gcd_result) => {
            if (err || !gcd_result) {
                var result = gcd(x, y);
                console.log("calculated result:", result);
                client.set(key, result);
                pgClient
                    .query('INSERT INTO values(number) VALUES ($1::int)', [result])
                    .catch(err => console.log(err));
                res.send({'result': result});
            } else {
                console.log("cached result:", gcd_result);
                res.send({'result': parseInt(gcd_result)});
            }
        });
        res.end;
    }
});

app.listen(8080, () => {
    console.log("Listening on port 8080");
})