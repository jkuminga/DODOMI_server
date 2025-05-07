const { error } = require('console');
var db = require('./db');
const util = require('util');
const query = util.promisify(db.query).bind(db);

module.exports = {
    list: async(req, res)=>{

        // 같은 value의 key가 title이면 selectitem wehere main = ?
        // else : select item where sub =? or all =? 
        var selectedCategory = req.params.categoryId;
        console.log('category:', selectedCategory); // 선택한 카테고리
        var key;
        var items;
          
        // 선택한 카테고리가 대분류 인지 소분류인지 확인
        try{
            var categories = await query(
                'SELECT * FROM menu'
            )
            // selectedCategory가 대분류인지 소분류인지 확인
            categories.forEach((category)=>{
                if(typeof key === 'undefined'){
                    key = Object.keys(category).find(key => category[key] === selectedCategory)
                }
            })

            // key = title or detailx or ALL
            if(typeof key === 'undefined'){
                selectedCategory = 'ALL'
            }

            // 아이템 불러오기
            if(key == "title"){
                items = await query(
                    'select it.title as title,it.item_id as item_id, it.price as price, im.url from item it inner join item_image im  on it.item_id = im.item_id WHERE it.maincategory=? and im.image_order = 1 and im.type = "thumbnail"',
                    [selectedCategory]
                )
    
            }else{
                items = await query(
                    "select it.title as title,it.item_id as item_id, it.price as price, im.url from item it inner join item_image im  on it.item_id = im.item_id WHERE (it.categoryALL = ? or it.subcategory = ?) and im.image_order = 1 and im.type = 'thumbnail';"
                    ,[selectedCategory,selectedCategory]
                )

            }
            console.log(items)

            res.json(items);
            
            
        }catch(error){
            console.log(error)

                res.json({
                result : "error",
                error : error,
                message : "error occured while loading items",
                code : 1
            })
        }
    },

    detail : async (req, res)=>{
        var itemId = req.params.itemId;

        // 1. await으로 item_id로 item테이블에서 불러오기
        // 2. 이미지 불러오는 promise 생성
        // 3. 각각의 변수에 넣기
        // 4. json 만들어서 서버에 전송

        try{
            var item = await query(
            `SELECT * FROM item WHERE item_id = ${itemId}`
            )

            const thumbs = await query(
                'SELECT url FROM item_image WHERE item_id = ? and type = ? ORDER BY image_order',
                [itemId, 'thumbnail']
            )

            const details = await query(
                'SELECT url FROM item_image WHERE item_id = ? and type = ? ORDER BY image_order',
                [itemId, 'detail']
            )

            const thumbUrls = [];
            const detailUrls = [];
            
            thumbs.forEach((thumb)=>{
                thumbUrls.push(thumb['url'])
            })
            details.forEach((detail)=>{
                detailUrls.push(detail['url'])
            })

            item = item[0]
            item['thumbUrls'] = thumbUrls
            item['detailUrls'] = detailUrls

            res.json(item)

        }catch(error){
            console.log(error)

            res.status(500).json({
                result : 'error',
                code : 1,
                error : error,
                message : "error occured while loading item"
            })
        }
    },

    create_new_item :  async (req, res)=>{
        var item = req.body;
        var title = item['title'];
        var price = item['price']; // 정수로 변경해야 함
        var colors = item['colors']; // list >> json Map으로 변경해야 함
        var options = item['options']; // list >> json Map으로 변경해야 함
        var mainCategory = item['mainCategory'];
        var subCategory = item['subCategory'];
        var keywords = item['keywords'];
        var thumbUrls = item['thumbUrls'];
        var detailUrls = item['detailUrls'];

        // 데이터 전처리
        price = parseInt(price);

        var options_json = {"기본" : "옵션을 선택해주세요"}
        var colors_json = {"기본" : "(필수) 선택해주세요"}

        for(var i = 0 ; i<options.length; i++){
            options_json[`옵션${i+1}`] = options[i];
        }
        for(var i = 0; i < colors.length; i++){
            colors_json[`색상${i+1}`] = colors[i];
        }

        var stringified_options = JSON.stringify(options_json);
        var stringified_colors = JSON.stringify(colors_json);

        // item 쿼리 오류 발생시 멈춤
        // item은 성공하고 thumbnail나 detailImages 작업 중 오류 발생 시 이미 등록된 item, thumbnail삭제
        // 현재 i 이전에 등록된 이미지들에 대해서는 item을 삭제하면 같이 삭제되서 처리할 필요 없음
        
        let insertId;
        try{
            const result = await query(
                'INSERT INTO item (title, price, colors, options, maincategory, subcategory, keywords) VALUES (?,?,?,?,?,?,?)',
                [title, price, stringified_colors, stringified_options, mainCategory, subCategory, keywords]
            );
    
            insertId = result.insertId;
    
            const insertImage = (type, urls)=>
                Promise.all(urls.map((url, i)=>
                    query(
                        'INSERT INTO item_image (item_id, type, image_order, url) VALUES (?,?,?,?)',
                        [insertId, type, i+1, url]
                    )
                ));
    
            await insertImage('thumbnail', thumbUrls);
            await insertImage('detail', detailUrls);
    
            res.json({
                result : "done",
                message : "new item emitted successfully",
                code : 0,
                itemId: insertId
            })
        }catch(error){
            console.log('error: ',error)

            console.log(insertId);
            if(typeof insertId !== 'undefined'){
                try{
                    await query(`DELETE FROM item WHERE item_id =${insertId}`)
                }catch(error){
                    console.log(error);
                }
            }

            res.status(500).json({
                result : 'error',
                error: error,
                message : '에러 발생',
                code : 1
            })
        }
    },

    update_item : async (req,res)=>{
        // 1. 데이터 불러오기
        var itemId = req.params.itemId;
        var item = req.body;
        const {
            title, price : rawPrice, colors, options, mainCategory, subCategory, keywords, thumbUrls, detailUrls
        } = item;

        // 2. 데이터 전처리
        const price = parseInt(rawPrice);

        var options_json = {"기본" : "옵션을 선택해주세요"}
        var colors_json = {"기본" : "(필수) 선택해주세요"}

        for(var i = 0 ; i<options.length; i++){
            options_json[`옵션${i+1}`] = options[i];
        }
        for(var i = 0; i < colors.length; i++){
            colors_json[`색상${i+1}`] = colors[i];
        }

        var stringified_options = JSON.stringify(options_json);
        var stringified_colors = JSON.stringify(colors_json);

        
        // 3. 아이템 업데이트
        let isItemUploaded = false;
        let isImageDeleted = false;
        try{
            const itemUpdateResult = await query(
                'UPDATE item SET title = ?, price = ?, colors = ? , options=?, maincategory =? , subcategory = ?, keywords = ? WHERE item_id = ?',
                [title, price, stringified_colors, stringified_options, mainCategory, subCategory, keywords, itemId]
            )
            isItemUploaded = true;
            console.log(isItemUploaded);

            const thumbDeleteResult = await query('DELETE FROM item_image WHERE item_id = ? AND type = "thumbnail"', [itemId]);
            const detailDeleteResult = await query('DELETE FROM item_image WHERE item_id = ? AND type = "detail"', [itemId]);
            isImageDeleted = true;  
            console.log('isImageDeleted',isImageDeleted);


            const updateImage = async (type, urls) => {
                const queries = urls.flatMap((url, i) => [
                  query('INSERT INTO item_image (item_id, type, image_order, url) VALUES (?, ?, ?, ?)', [
                    itemId,
                    type,
                    i + 1,
                    url,
                  ]),
                ]);
              
                await Promise.all(queries);
              };

            if(isImageDeleted){
                const thumb_update_result = await updateImage('thumbnail', thumbUrls);
                const detail_update_result = await updateImage('detail', detailUrls);
            }else{
                throw(error(
                ));
            }
            

            res.json({
                result :'done',
                message : "item updated Successfully",
                code : 0,
                itemId : itemId
            })

        }catch(error){
            console.log(error)

            if(!isItemUploaded){
                res.status(500).json({
                    result :'error',
                    error : error,
                    code : 1,
                    message : 'could not update item successfully'
                })
            }else if(isImageDeleted){
                res.status(500).json({
                    result :'error',
                    error : error,
                    code : 2,
                    message : 'error occured while deleting previous images'
                })
            }
            else{
                res.status(500).json({
                    result :'error',
                    error : error,
                    code : 3,
                    message : 'item updated, but somehow images did not updated.'
                })
            }
        }


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

    search_items: async (req, res)=>{
        var keywords = req.body['keywords'];
        console.log(keywords);

        try{
            const items = await query(
                'select it.title as title,it.item_id as item_id, it.price as price, im.url from item it inner join item_image im  on it.item_id = im.item_id WHERE (it.title LIKE ? or it.keywords LIKE ?) and im.image_order = 1 and im.type = "thumbnail"'
                ,[keywords, keywords]
            )

            console.log(items);

            res.json(items);
        }catch(error){
            console.log(error)

            res.status(500).json({
                result : "error",
                error: error,
                code: 1,
                message : "error occured while seaching items"
            })
        }
    }
}