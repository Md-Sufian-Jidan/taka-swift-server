const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 9000;


app.get((req, res) => {
    res.send('taka swift is running');
})

app.listen(port , () => {
    console.log('taka swift is running on port', port);
})