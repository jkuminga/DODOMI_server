const db = require('./db');

module.exports = {
    get_notice : (req, res)=>{
        var noticeId = req.params.noticeId;
        

        if(noticeId == 'all' || noticeId == 'ALL'){
            

            db.query('SELECT * FROM notice ORDER BY isPinned DESC, date DESC', (err, notice_list)=>{
                if(err){
                    console.log(err);
                    res.json({
                        "result" : "error occured while loading data",
                        "error" : err
                    })
                }else{
                    res.json(notice_list);
                }
            })
        }else{
            db.query(`select * from notice where id = ${noticeId}`, (err2, notice)=>{
                if(err2){
                    console.log(err2);
                    res.json({
                        "result" : "error occured while loading data",
                        "error" : err2
                    })
                }else{
                    res.json(notice);
                }
            })
        }
    },

    create_new_notice : (req, res)=>{
        var body = req.body;
        
        var title = body['title'];
        var descriptions = [
            body['descript1'],
            body['descript2'],
            body['descript3'],
            body['descript4'],
            body['descript5'],
            body['descript6'],
            body['descript7'],
            body['descript8'],
            body['descript9'],
            body['descript10'],
        ];
        for(var i = 0 ; i < descriptions.length ; i ++){
            if(descriptions[i] == "" || descriptions[i] == "null"){
                descriptions[i] = null
            }
        }
        var isPinned = body['isPinned'];
        if(isPinned == true){
            isPinned = "T"
        }else{
            isPinned = "F"
        }

        db.query('INSERT INTO notice (title, isPinned, date, descript1,descript2,descript3,descript4,descript5,descript6,descript7,descript8,descript9,descript10) VALUES (?,?,now(),?,?,?,?,?,?,?,?,?,?)',
            [title, isPinned, descriptions[0],descriptions[1],descriptions[2],descriptions[3],descriptions[4],descriptions[5],descriptions[6],descriptions[7],descriptions[8],descriptions[9]], (error, result)=>{
                if(error) {
                    console.log(error)
                    res.json({
                        "result" : "error occured",
                        "error" : error
                    })
                }else{
                    res.json({
                        "result" : "notice updated successfully"
                    })
                }
            }
        )
    },

    update_notice : (req ,res)=>{
        var noticeId = req.params.noticeId;
        var notice = req.body;

        var title = notice['title'];
        var isPinned = notice['isPinned'];
        var descriptions = [
            notice['descript1'],
            notice['descript2'],
            notice['descript3'],
            notice['descript4'],
            notice['descript5'],
            notice['descript6'],
            notice['descript7'],
            notice['descript8'],
            notice['descript9'],
            notice['descript10'],
        ];

        var isPinned = notice['isPinned'];
        if(isPinned == true){
            isPinned = "T"
        }else{
            isPinned = "F"
        }



        for(var i = 0 ; i<descriptions.length;i++){
            if(descriptions[i] == "null" || descriptions[i] == ""){
                descriptions[i] = null
            }
        }

        db.query('UPDATE notice SET title = ?, descript1 = ?,descript2 = ?,descript3 = ?,descript4 = ?,descript5 = ?,descript6 = ?,descript7 = ?,descript8 = ?,descript9 = ?,descript10 = ?, isModified ="T", isPinned = ? where id = ?', 
            [title, descriptions[0] ,descriptions[1],descriptions[2],descriptions[3],descriptions[4],descriptions[5],descriptions[6],descriptions[7],descriptions[8],descriptions[9], isPinned, noticeId], (error, result)=>{
                if(error){
                    console.log(error);
                    res.status(500).json({
                        "result" : "error occured",
                        "error" : error
                    })
                }else{
                    res.json({
                        "result" : "notice updated successfully"
                    })
                }
            }
        )


    },

    delete_notice : (req, res)=>{
        var noticeId = req.params.noticeId;

        db.query(`DELETE FROM notice where id=${noticeId}`, (error, result)=>{
            if(error) {
                console.log(error)
                res.status(500).json({
                    "result" : "error occured while deleting data",
                    "error" : error
                })
            }else{
                res.json({
                    "result" : "notice deleted successfully"
                })
            }
        })
    }
}