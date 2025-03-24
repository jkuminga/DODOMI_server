const cloudinary = require('cloudinary').v2
const multer = require('multer');
const db = require('./db');

module.exports = {
    get_password : (req, res)=>{
        db.query('SELECT * FROM password', (error, password)=>{
            var pw = password[0]['password'];

            if(error){
                console.log(error);
                res.status(500).json({
                    "results" : "error occured",
                    "error" : error,
                })
            }else{
                res.send(pw)
            }
        })
    },

    change_password : (req, res)=>{
        var new_password = req.body['new_password']

        db.query('UPDATE password SET password = ? ', [new_password], (error, results)=>{
            if(error){
                console.log(error)
                res.status(500).json({
                    "result" : "error Occured",
                    "error" : error
                })
            }else{
                res.end();
            }
        })

    }



}


