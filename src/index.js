const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

// app.get('/', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`App listening on port: ${port}`));
