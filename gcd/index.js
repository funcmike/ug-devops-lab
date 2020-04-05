const express = require('express');
const redis = require('redis');
const process = require('process');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const client = redis.createClient({
    host: 'redis-server',
    port: '6379'
});

function gcd(x, y) {
    if ((typeof x !== 'number') || (typeof y !== 'number')) 
      return 0;
    x = Math.abs(x);
    y = Math.abs(y);
    while(y) {
      var t = y;
      y = x % y;
      x = t;
    }
    return x;
  }


app.post('/', (req, res) => {{
    console.log("input:", req.body);
    var x = parseInt(req.body.x);
    var y = parseInt(req.body.y);
    var key =  x+"-"+y;
    if (y > x) {
        var key = y+"-"+x
    }
    console.log("key:", key );
    client.get(key, (err, gcd_result) => {
        if (err || !gcd_result ) {
            var result = gcd(x,y);
            console.log("calculated result:", result);
            client.set(key, result);
            res.send(result.toString());    
        } else {
            console.log("cached result:", gcd_result);
            res.send(gcd_result);
    
        }
    });
    res.end;
}});

app.listen(8080, () => {
    console.log ("Listening on port 8080");
})