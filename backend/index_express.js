const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send('Hello');
});

app.get('/hello', (req, res)=>{
    res.send('Hello World');
})

app.get('/json', (req, res) => {
    res.json({message: "jordan message", name: "Michel Jordan"});
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
})  