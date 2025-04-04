var db = require('./db');

module.exports = {
    list : (req, res)=>{
        var category = req.params.categoryId; // 카테고리 id x / 카테고리 이름름
        console.log('category:',category);
        var maincategory = null;



        db.query('SELECT maincategory FROM item', (err, results)=>{
            if(err){
                console.log(err)
            }

            for(var i = 0; i<results.length;i++){
                if(results[i]['maincategory'] == category) {
                    maincategory = results[i]['maincategory'];
                }
            }

            if(maincategory != null) {
                db.query(`SELECT * from item where maincategory = '${maincategory}'`, (err2, lists)=>{
                    if(err2) {console.log(err2)}
                    res.send(lists);});
            }
            else{
                console.log('selected');
                db.query('SELECT * FROM item WHERE subcategory = ? or categoryALL = ? ', [category,category], (err3, list)=>{
                    if(err3) {console.log(err3)}
                    console.log(list);
    
                    res.send(list);
                })
            }
        });
            // console.log('maincategory',maincategory);
            
    },

    detail : (req, res) => {
        var itemId = req.params.itemId;

        db.query('SELECT * from item WHERE item_id = ?', itemId, (err, itemDetail)=>{
            if(err) {console.log(err)}
            res.json(itemDetail);
        })
    },

    create_new_item : (req, res)=>{
        var item = req.body;
        console.log(item);

        var title = item['title']; // String
        var thumbnails = [item['thumbnail1'],item['thumbnail2'],item['thumbnail3'],item['thumbnail4'],item['thumbnail5']]; // String: url
        for(var i = 0; i < thumbnails.length; i++){
            if(thumbnails[i] == '' || thumbnails[i] == "null"){
                thumbnails[i] = null;
            }
        }

        var price = parseInt(item['price']); // int
        var colors = item['colors']; 
        var options = item['options']; 
        var maincategory = item['maincategory'];
        var subcategory = item['subcategory'];
        var detailImages = [item['detailImage1'],item['detailImage2'],item['detailImage3'],item['detailImage4'],item['detailImage5'],item['detailImage6'],item['detai8Image7'],item['detailImage8'],item['detailImage9'],item['detailImage10'],];
        var keywords = item['keywords'];
        for(var i = 0; i < detailImages.length ; i++){
            if(detailImages[i]=='' || detailImages[i] == 'null'){
                detailImages[i] = null;
            }
        }
        
        var options_json = {
            "기본" : "옵션을 선택해주세요",
        };

        
        for(var i = 0 ; i < options.length ; i++ ){
            options_json[`옵션${i+1}`] = options[i];
        };

        var stringified_options = JSON.stringify(options_json);


        var colors_json ={
            "기본" : "(필수) 선택해주세요"
        }
        for(var i = 0; i < colors.length; i++){
            colors_json[`색상${i+1}`] = colors[i];
        }
        var stringified_colors = JSON.stringify(colors_json);

        db.query('INSERT INTO item (title, thumbnail1, thumbnail2, thumbnail3, thumbnail4, thumbnail5, price, colors, options, maincategory,subcategory,keywords, detailImage1,detailImage2,detailImage3,detailImage4,detailImage5,detailImage6,detailImage7,detailImage8,detailImage9,detailImage10) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [
            title, thumbnails[0], thumbnails[1], thumbnails[2],thumbnails[3],thumbnails[4], price, stringified_colors, stringified_options, maincategory,subcategory, keywords,detailImages[0],detailImages[1],detailImages[2],detailImages[3],detailImages[4],detailImages[5],detailImages[6],detailImages[7],detailImages[8],detailImages[9]
        ], (error, results)=>{
            if(error) {
                console.log(error);
                res.status(500).json({
                    "result" : "error occured",
                    "error" : error
                })
            }else{
                
                res.json({
                    "result" : "item uploaded successfully",
                    "item_id" : 1
                })
            }
        })

    },

    update_item : (req, res) =>{
        var itemId = req.params.itemId;
        var item = req.body;

        console.log(item);

        var title = item['title'];
        var thumbnails = [item['thumbnail1'],item['thumbnail2'],item['thumbnail3'],item['thumbnail4'],item['thumbnail5']];
        var options = item['options'];
        var colors = item['colors'];
        var price = parseInt(item['price']);
        var main_category = item['maincategory'];
        var sub_category = item['subcategory'];
        var detailImages = [item['detailImage1'],item['detailImage2'],item['detailImage3'],item['detailImage4'],item['detailImage5'],item['detailImage6'],item['detailImage7'],item['detailImage8'],item['detailImage9'],item['detailImage10'],];
        var keywords = item['keywords'];
        
        for(var i = 0 ;i<thumbnails.length;i++){
            if(thumbnails[i] == ""){
                thumbnails[i] = null;
            }
        }

        for(var i = 0; i < detailImages.length ; i++){
            if(detailImages[i] == ""){
                detailImages[i] = null;
            }
        }

        var options_json = {
            "기본" : "옵션을 선택해주세요",
        };
        for(var i = 0 ; i < options.length ; i++ ){
            options_json[`옵션${i+1}`] = options[i];
        }
        var stringified_options = JSON.stringify(options_json);

        var colors_json ={
            "기본" : "(필수) 선택해주세요"
        }
        for(var i = 0; i < colors.length; i++){
            colors_json[`색상${i+1}`] = colors[i];
        }
        var stringified_colors = JSON.stringify(colors_json);
        
        db.query('UPDATE item SET title = ?, price = ?, thumbnail1 = ?, thumbnail2 = ?, thumbnail3 = ?, thumbnail4 = ?, thumbnail5 = ?, colors  = ? ,options = ? , maincategory = ?, subcategory= ?, keywords=?, detailImage1=?,detailImage2=?,detailImage3=?,detailImage4=?,detailImage5=?,detailImage6=?,detailImage7=?,detailImage8=?,detailImage9=?,detailImage10=? where item_id=?',
            [title, price, thumbnails[0], thumbnails[1], thumbnails[2], thumbnails[3], thumbnails[4], stringified_colors, stringified_options, main_category, sub_category,keywords, detailImages[0],detailImages[1],detailImages[2],detailImages[3],detailImages[4],detailImages[5],detailImages[6],detailImages[7],detailImages[8],detailImages[9], itemId],(error, result)=>{
                if(error){
                    console.log(error)
                    res.status(500).json({
                        "result" : "error occurred during update",  
                        "error" : error
                    })
                } else{
                    res.json({
                        "result" : "item uploaded successfully"
                    })
                }
            }
        )
    },

    delete_item : (req, res)=>{
        var itemId = req.params.itemId;

        db.query(`DELETE FROM item WHERE item_id=${itemId}`, (error, result)=>{
            if(error){
                console.log(error)
                res.status(500).json({
                    "result" : "error occured",
                    "error" : error
                })
            }else{
                res.json({
                    "result" : "item deleted successfully"  
                })
            }
        })
    },
    
    search_items : (req, res)=>{
        var keyword = req.body['keyword'];
        console.log(keyword);   

        db.query("SELECT * FROM item WHERE title LIKE ? or keywords LIKE ?", [`%${keyword}%`,`%${keyword}%`], (error, items)=>{
            if(error){
                console.log(error);
                res.status(500).json({
                    "result" : "error occured",
                    "error" : error
                })
            }else{
                console.log(items);
                res.json(items);
            }
        });
    }
}