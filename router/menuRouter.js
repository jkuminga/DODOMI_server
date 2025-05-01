const express = require('express');
const router = express.Router();
const menu = require('../lib/menu');


router.get('/getmenu', (req, res)=>{
    menu.getmenu(req, res);
})

router.post('/addcategory', (req, res)=>{
    menu.add_new_category(req, res);
})

router.get('/getsinglemenu/:menuId', (req, res)=>{
    menu.get_single_menu(req, res);
})

router.post('/updatemenu/:menuId', (req, res)=>{
    menu.update_single_menu(req, res);
})

router.post('/deletemenu/:menuId', (req, res)=>{
    menu.delete_single_menu(req, res);
})

module.exports = router;