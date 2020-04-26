const keys = require('./keys')

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());


console.log(keys);

const redis = require('redis');
const client = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});


const { Pool } = require('pg');
const pgClient = new Pool({
    host: keys.pgHost,
    port: keys.pgPort,
    database: keys.pgDb,
    user: keys.pgUser,
    password: keys.pgPass,
})

pgClient.on('error', () => console.log('better use mysql next time'))


pgClient
    .query('CREATE TABLE IF NOT EXISTS results (list json)')
    .catch(err => console.log(err));


const mergeSort = (list) =>{
    if(list.length <= 1) return list;
    const middle = list.length / 2 ;
    const left = list.slice(0, middle);
    const right = list.slice(middle, list.length);
    return merge(mergeSort(left), mergeSort(right));
}
      
const merge = (left, right) => {
    var result = [];
    while(left.length || right.length) {
        if(left.length && right.length) {
            if(left[0] < right[0]) {
                result.push(left.shift())
            } else {
                result.push(right.shift())
            }
        } else if(left.length) {
            result.push(left.shift())
        } else {
            result.push(right.shift())
        }
    }
    return result;
}

app.get('/', (req, res) => {
    res.send('Hello hit ctrl+c to continue')
})

app.get('/values', (req, res) => {
    {
        pgClient
        .query('SELECT list from results')
        .then(results => {
            console.log(results.rows)
            res.send(results.rows);
          })
        .catch(err => console.log(err));
    }

});

app.post('/', (req, res) => {
    {
        console.log("input:", req.body);
        var input = (req.body.input);
        var key = input.join(',');

        console.log("key:", input);

        client.lrange(key, 0, -1,  (err, sorted) => {
            if (err || !sorted || sorted.length == 0) {
                var result = mergeSort(input);
                console.log("sorted result:", result);
                client.rpush(key, result);
                pgClient
                    .query('INSERT INTO results (list) VALUES ($1::json)', [{"result": result, "input": input}])
                    .catch(err => console.log(err));
                res.send({'result': result});
            } else {
                var cached_result = sorted.map(numStr => parseInt(numStr))
                console.log("cached result:", cached_result);
                res.send({'result': cached_result});
            }
        });
        res.end;
    }
});


const port = 5000;

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})