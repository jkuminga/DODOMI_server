const express = require('express');
const app = express();
const bodyParser = require('body-parser');
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

// import Routers

const noticeRouter = require('./router/noticeRouter');
const itemRouter = require('./router/itemRouter');
const manageRouter = require('./router/manageRouter');
const purchaseRouter = require('./router/purchaseRouter');
const menuRouter = require('./router/menuRouter');

// body-Parser Setting
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

// Router Setting
app.use('/item', itemRouter);
app.use('/notice', noticeRouter);
app.use('/manage', manageRouter);
app.use('/purchase', purchaseRouter);
app.use('/menu', menuRouter);


var port = process.env.PORT;
app.listen(port, ()=>{
    console.log(`connected to PORT: ${port}`);
})