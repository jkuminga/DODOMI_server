const cloudinary = require('cloudinary').v2
const multer = require('multer');
const pool = require('./db');

module.exports = {

    get_password : async (req, res)=>{
        try{
            const [password, _password] = await pool.query('SELECT * FROM password');
            console.log(password)


            console.log('✅비밀번호 불러오기 완료');
            res.json(password[0]['password'])
        }catch(e){
            console.log('❌비밀번호 불러오기 실패');
            console.log(e);
            res.status(500).json({
                result : 'error occured',
                error : e
            })
        }

        // db.query('SELECT * FROM password', (error, password)=>{
        //     var pw = password[0]['password'];

        //     if(error){
        //         console.log(error);
        //         res.status(500).json({
        //             "results" : "error occured",
        //             "error" : error,
        //         })
        //     }else{
        //         res.send(pw)
        //     }
        // })
    },

    change_password : async(req, res)=>{
        var new_password = req.body['password']
        console.log(new_password);

        try{
            await pool.query(`UPDATE password SET password = ${new_password}`);

            console.log('✅비밀번호 변경 완료');

            res.status(200).json({
                result : 'done'
            })
        }catch(e){
            console.log('❌비밀번호 변경 실패');
            console.log(e);
            res.status(500).json({
                result : "error occured",
                error : e
            })
        }

    }
}


