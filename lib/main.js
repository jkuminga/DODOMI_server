const pool = require('./db');
// const util = require('util');
// const query = util.promisify(db.query).bind(db);
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { verify } = require('crypto');

const SECRET_KEY = process.env.SECRET_KEY;

module.exports = {
    home : (req, res)=>{
        var context = {
            new : 'new'
        }

        res.render('main', context, (err, html)=>{
            res.end(html);
        })

    },

    login : async (req, res)=>{
        const [data, _data] = await pool.query('SELECT * FROM password');

        const password = data[0]['password'];

        const byUser = req.body['password'];

        

        if(password == byUser){
            const payload = {
                password : byUser
            }

            const token = jwt.sign(payload, SECRET_KEY, {expiresIn: '1h'});

            console.log('✅로그인 완료');
            return res.status(200).json({
                result : 'success',
                token : token
            })
        }else{
            console.log('❌로그인 실패');
            return res.status(500).json({
                result : 'failed',
                message : 'invalid password'
            })
        }
    },

    
    verifyToken  : (req, res)=>{
        const authHeader = req.headers['authorization'];

        if(!authHeader){
            console.log('❌전달된 토큰이 없습니다.');
            return res.status(401).json({
                message : 'No token Provided'
            })
        }

        const token = authHeader.split(' ')[1];

        jwt.verify(token, SECRET_KEY, (error, decoded)=>{
            if(error){
                console.log('❌토큰 검증 실패');
                console.log(error);
                return res.status(403).json({
                    message : 'Invalid or expired Token'
                })
            }else{
                console.log('✅verified!');
                return res.status(200).json({
                    message : 'Valid User'
                });
            }
        })
    }

}