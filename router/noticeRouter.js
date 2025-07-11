const express = require('express');
var router = express.Router();
const notice = require('../lib/notice');

router.get('/:noticeId', (req, res)=>{
    notice.get_notice(req, res);
})

router.post('/create', (req, res)=>{
    notice.create_new_notice(req, res);
})

router.post('/update/:noticeId', (req, res)=>{
    notice.update_notice(req, res);
})

router.delete('/:noticeId', (req, res)=>{
    notice.delete_notice(req, res)
})

module.exports = router;