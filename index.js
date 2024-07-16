const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
// const jwt = require('jsonwebtoken');
const port = process.env.PORT || 9000;
const options = {
    origin: [
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    credentials: true,
    optionSuccessStatus: 200,
}
//middlewares
app.use(cors(options));
app.use(express.json());


// middlewares 
const verifyToken = (req, res, next) => {
    console.log('inside verify token 66', req?.headers?.authorization);
    if (!req?.headers?.authorization) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = req.headers.authorization.split(' ')[1];
    console.log('line 71', token);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'unauthorized access' })
        }
        req.decoded = decoded;
        next();
    });
};


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qvjjrvn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const usersCollections = client.db('taka-swift').collection('users');

        // jwt related api
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
            res.send({ token });
        });

        // USER DATA SAVE APi
        app.post('/save/user', async (req, res) => {
            const user = req.body;
            const finalUser = { ...user, role: "user" }
            const query = { email: user.email };
            const existingUser = await usersCollections.findOne(query);
            if (existingUser) {
                return res.send({ message: 'user already exists', insertedId: null })
            }
            const result = await usersCollections.insertOne(finalUser);
            res.send(result);
        });

        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', async (req, res) => {
    res.send('taka swift is running');
})

app.listen(port, () => {
    console.log('taka swift is running on port', port);
})