import express from 'express';

const httpServer = express();

httpServer.get('/', (req, res) => {
  res.send('Hello World!');
});

httpServer.listen(3000, () => console.log('Server started on port 3000'));
