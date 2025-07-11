const express = require('express');
const router = express.Router();
const menu = require('../lib/menu');


router.get('/list', (req, res)=>{
    menu.getMenuList(req, res);
})

router.post('/new', (req, res)=>{
    menu.add_new_category(req, res);
})

router.get('/getsinglemenu/:menuId', (req, res)=>{
    menu.get_single_menu(req, res);
})

router.patch('/:menuId', (req, res)=>{
    menu.update_single_menu(req, res);
})

router.delete('/:menuId', (req, res)=>{
    menu.delete_single_menu(req, res);
})

module.exports = router;