import express from 'express';
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Handle POST request to /echo
app.post('/echo', (req, res) => {
    console.log('Received request:', req.body);

    // Respond with the received request body
    res.json(req.body);
});

app.listen(port, () => {
    console.log(`Echo server listening at http://localhost:${port}`);
});
