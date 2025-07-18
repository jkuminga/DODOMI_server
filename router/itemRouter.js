const express = require('express');
var router = express.Router();
var item = require('../lib/items');
var multer = require('multer');

var upload = multer();  


router.get('/list/:categoryId', (req,res)=>{
    item.list(req, res);
})

router.get('/detail/:itemId', (req, res)=>{
    item.detail(req, res);
})

router.post('/new', (req, res)=>{
    item.create_new_item(req, res);
})

router.post('/update/:itemId', (req, res)=>{
    item.update_item(req, res)
})

router.delete('/:itemId', (req, res)=>{
    item.delete_item(req, res);
})

router.get('/search/:keywords', upload.none(), (req, res)=>{
    item.search_items(req, res);
})

router.get('/itemdetail/:itemId',(req, res)=>{
    item.getItemList(req, res);
})

module.exports = router;