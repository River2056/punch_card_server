const express = require('express');
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const app = express();
const PORT = 5000
const dbUrl = 'mongodb+srv://River2056:kevin2056@cluster0.spkcl.mongodb.net/pcard?retryWrites=true&w=majority';
let client = null;

app.get('/', (req, res) => {
    console.log('url hit at /');
    res.send('<h1>Hello World!</h1>');
    res.end();
});

// api to write to mongodb
app.get('/write-time', async (req, res) => {
    const year = req.query.year;
    const month = req.query.month;
    const date = req.query.date;
    const time = req.query.time;
    const status = req.query.status;
    console.log('url hit at write time...');
    let cardObj = { 
        year,
        month,
        date, 
        time, 
        status
    };
    client = new MongoClient(dbUrl, { useUnifiedTopology: true, useNewUrlParser: true, connectTimeoutMS: 30000, keepAlive: 1 });
    client.connect(async err => {
        const collection = await client.db("pcard").collection("attendance");
        // perform actions on the collection object
        await collection.insertOne(
            cardObj,
            async (err, res) => {
                if (err) throw err;
                console.log('1 record inserted...', cardObj);
                await client.close();
            }
        );
    });

    console.log('db insert done!');
    res.send(`
        <h1>you hit write time url</h1>
        <h2>punching card to firebase...</h2>
    `);
    res.end();
});

app.listen(PORT, () => console.log(`listening at port: ${PORT}`));