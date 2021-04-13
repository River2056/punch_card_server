const express = require('express');
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const app = express();
const PORT = 5000
const dbUrl = 'mongodb+srv://River2056:kevin2056@cluster0.spkcl.mongodb.net/pcard?retryWrites=true&w=majority';
let client = null;

app.get('/', (req, res) => {
    console.log('url hit at /');
    res.send(`
        <h1>Punch Card API Server</h1>
        <h2>routes</h2>
        <ul>
            <li>/</li>
            <li>e.g. /write-time?year=2021&month=4&date=12&time=9:3:30&status=work</li>
            <li>e.g. /get-monthly?month=4</li>
        </ul>
    `);
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
    client = getDBinstance();
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

// api to fetch all records

// api to fetch monthly records
app.get('/get-monthly', async (req, res) => {
    const date = new Date();
    const year = date.getFullYear();
    const month = req.query.month;
    console.log('url hit at get-monthly records...');
    let pageData = '';

    client = getDBinstance();
    client.connect(async err => {
        const collection = await client.db("pcard").collection("attendance");
        const cursor = await collection.find({ "year": year.toString(), "month": month.toString() });
        const data = await cursor.toArray();
        const pageDataArray = data.map(e => {
            return `${JSON.stringify(e)}, <br/>`;
        });
        pageData = pageDataArray.join('\n');
        console.log(pageData);
        res.send(`
            <h1>Results for year ${year}, month ${month}</h1>
            <div>
                <ol>
                    ${pageData.split(', ').map(e => `<li>${e}</li>`)}
                </ol>
            </div>
        `);
        console.log('done querying month data!');
        res.end();
        await client.close();
    });
});

app.listen(process.env.PORT || PORT, () => console.log(`listening at port: ${PORT}`));


function getDBinstance() {
    return new MongoClient(dbUrl, { useUnifiedTopology: true, useNewUrlParser: true, connectTimeoutMS: 30000, keepAlive: 1 });
}