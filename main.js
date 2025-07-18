const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
    cloud_name : 'dddvvp9de',
    api_key :  process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET,
})

//ejs engine setting
app.set('views', './views');
app.set('view engine', 'ejs');

// body-Parser Setting
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

// cors-setting
app.use(cors());

// import Routers

const noticeRouter = require('./router/noticeRouter');
const itemRouter = require('./router/itemRouter');
const manageRouter = require('./router/manageRouter');
const menuRouter = require('./router/menuRouter');


// Router Setting
app.use('/item', itemRouter);
app.use('/notice', noticeRouter);
app.use('/manage', manageRouter);
app.use('/menu', menuRouter);


// main logic
const main = require('./lib/main');
const { populate } = require('dotenv');

app.post('/login', (req, res)=>{
    main.login(req, res);
})

app.get('/verify', (req, res)=>{
    main.verifyToken(req, res);
})


var port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log(`connected to PORT: ${port}`);
})