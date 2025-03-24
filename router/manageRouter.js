// 로그인 화면도 여기 포함
const express = require('express');
var router = express.Router();
var manage = require('../lib/manage');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // 'uploads' 폴더에 저장
    },
    filename: function (req, file, cb) {
      // 파일명은 현재 타임스탬프와 원본 파일명을 결합하여 지정
      cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage});

router.post('/uploadimg',upload.single('file'), async (req, res)=>{
    try{
        var image = req.file.path;
        var public_id = Path.parse(req.file.filename).name;

        const uploadResult = await cloudinary.uploader.upload(
            image, {
                folder:'dodomi',
                public_id: public_id,
            }
        )
        var imageUrl = uploadResult.secure_url;
        console.log(imageUrl);

        res.json({
            message: "File uploaded successfully to cloudinary",
            url : imageUrl,
        })
    }catch (error) {
        console.error(`upload error : ${error}`);
        res.status(500).json({
            message: 'File upload failed',
            error: error.message,
        });
    }
})

router.get('/getpw', (req, res)=>{
    manage.get_password(req, res);
})

router.post('/changepw', (req, res)=>{
    manage.change_password(req, res);
})

module.exports = router;