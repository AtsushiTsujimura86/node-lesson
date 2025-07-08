const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;


// Middleware to parse JSON bodies
//without this, req.body will be undefined
//postでjsonデータを受け取るために必須
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello');  
}); 

app.post('/post', (req, res) =>{
    const data = req.body;
    console.log('Received POST data:', data);
    res.json({ message: 'Data received successfully', receivedData: data });

})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});