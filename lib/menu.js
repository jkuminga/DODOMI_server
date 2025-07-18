const pool = require('./db');
// const util = require('util');
// const query = util.promisify(db.query).bind(db);

module.exports = {
    getMenuList : async (req, res) =>{
        try{
            const [result, _result] = await pool.query('SELECT * FROM menu');
            console.log('✅메뉴(카테고리) 리스트 불러오기 완료');
            res.status(200).json(result);
        }catch(e){
            console.log('❌메뉴(카테고리) 리스트 불러오기 실패');
            console.log(e);
            res.status(500).json({
                result : 'error occured',
                error : e
            })
        }
        // db.query('SELECT * FROM menu', (error, menu)=>{
        //     if(error) {
        //         console.log(error)
        //         res.status(500).json({
        //             "result" : "error occured",
        //             "error" : error
        //         })
        //     }else{
        //         res.json(menu);
        //     }
            
        // })
    },

    get_single_menu : async(req, res)=>{
        var menuId = req.params.menuId;
        try{
            const [result, _result] = await pool.query(`SELECT * from menu where menuId = ${menuId}`)
            console.log('✅단일 메뉴(카테고리) 불러오기 완료');
            res.status(200).json(result);
        }catch(e){
            console.log('❌단일 메뉴(카테고리) 불러오기 실패');
            console.log(e)
            res.status(500).json({
                result : 'error occured',
                error : e
            })
        }
        
        // db.query(`SELECT * from menu where menuid = ${menuId}`, (error, menu)=>{
        //     if(error) { 
        //         console.log(error)
        //         res.json({
        //             "result" : "오류가 발생했습니다", 
        //             "error" : error
        //         })
        //     }else{
        //         res.json(menu)
        //     }
            
        // })
    },
    
    
    add_new_category : async (req, res)=>{
        var menu = req.body;

        var menuList = [menu['title'], menu['detail1'], menu['detail2'], menu['detail3'], menu['detail4'], menu['detail5']];
        
        for(var i = 1; i < menuList.length;  i++){
            if(menuList[i] == "" || menuList[i] == "null"){
                menuList[i] = null
            }
        }

        try{
            await pool.query('INSERT INTO menu (title, detail1, detail2, detail3, detail4, detail5) VALUES (?,?,?,?,?,?)', [menuList[0],menuList[1],menuList[2],menuList[3],menuList[4],menuList[5]]);

            console.log('✅메뉴(카테고리) 생성 완료');
            res.status(200).json({
                result : 'done'
            })
        }catch(e){
            console.log('❌메뉴(카테고리) 생성 실패');
            console.log(e)
            res.status(500).json({
                result : 'error occured',
                error : e
            })
        }
    },
    
    update_single_menu : async(req, res)=>{
        var menuId = req.params.menuId;
        var body = req.body;

        console.log('전송받은 메뉴 데이터',body);
        
        var title = body['title'];
        var detail1, detail2, detail3, detail4, detail5;

        if(body['detail1'] == "") {
            detail1 =null;
        }else{
            detail1 = body['detail1'];
        }

        if(body['detail2'] == "") {
            detail2 =null;
        }else{
            detail2 = body['detail2'];
        }

        if(body['detail3'] == "") {
            detail3 =null;
        }else{
            detail3 = body['detail3'];
        }

        if(body['detail4'] == "") {
            detail4 =null;
        }else{
            detail4 = body['detail4'];
        }

        if(body['detail5'] == "") {
            detail5 =null;
        }else{
            detail5 = body['detail5'];
        }

        try{
            await pool.query('UPDATE menu SET title = ?, detail1 = ?, detail2 = ?, detail3 =?, detail4 = ? ,detail5 = ? WHERE menuId=?' , [title, detail1, detail2, detail3, detail4, detail5, menuId])

            console.log('✅메뉴(카테고리) 수정 완료');

            res.status(200).json({
                result: 'done'
            })
        }catch(e){
            console.log('❌메뉴(카테고리) 수정 실패');
            console.log(e);
            res.status(500).json({
                result : 'error occured',
                error: e
            })
        }

    },

    delete_single_menu: async(req, res)=>{
        var menuId = req.params.menuId;

        try{
            await pool.query('DELETE FROM menu WHERE menuId =?', [menuId]);

            console.log('✅메뉴(카테고리) 삭제 완료');
            res.status(200).json({
                result : 'done'
            })

        }catch(e){
            console.log('❌메뉴(카테고리) 삭제 실패');
            console.log(e);
            res.status(500).json({
                result : 'error occured',
                error : e
            })
        }
        
        // db.query(`DELETE FROM menu WHERE menuId=${menuId}`, (error, results)=>{
        //     if(error) {
        //         console.log(error)
        //         res.json({
        //             "results" : "error occured",
        //             "error" : error
        //         })
        //     }else{
        //         res.json({
        //             "results" : "menu deleted successfully"
        //         })
        //     }
        // })
    }
}