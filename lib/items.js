const { error } = require('console');
var pool = require('./db');
// const util = require('util');
// const query = util.promisify(db.query).bind(db);

module.exports = {
    getItemList : async (req, res)=>{
        const itemId = req.params.itemId;

        try{
            const [itemList] = await pool.query('SELECT * from item');


            console.log('✅아이템 리스트 불러오기 완료');
            res.json(itemList);

            // var [categories] = await pool.query(
            //     'SELECT * FROM menu'
            // )

            // res.json(categories);
        }catch(e){
            console.log('❌아이템 리스트 불러오기 실패');
            console.log(e);
            res.status(500).json({
                error : e
            })
        }
        
    },

    list: async(req, res)=>{

        // 같은 value의 key가 title이면 selectitem wehere main = ?
        // else : select item where sub =? or all =? 
        var selectedCategory = req.params.categoryId;
        console.log('category:', selectedCategory); // 선택한 카테고리
        var key;
        var items;
           
        // 선택한 카테고리가 대분류 인지 소분류인지 확인
        try{
            var [categories] = await pool.query(
                'SELECT * FROM menu'
            )
            // selectedCategory가 대분류인지 소분류인지 확인
            categories.forEach((category)=>{
                if(typeof key === 'undefined'){
                    key = Object.keys(category).find(key => category[key] === selectedCategory)
                }
            })
            console.log(key);

            // key = title or detailx or ALL
            if(typeof key === 'undefined'){
                selectedCategory = 'ALL'
            }

            // 아이템 불러오기
            if(key == "title"){
                items = await pool.query(
                    'select it.title as title,it.item_id as item_id, it.price as price, im.url from item it inner join item_image im  on it.item_id = im.item_id WHERE it.maincategory=? and im.image_order = 1 and im.type = "thumbnail"',
                    [selectedCategory]
                )
    
            }else{
                items = await pool.query(
                    "select it.title as title,it.item_id as item_id, it.price as price, im.url from item it inner join item_image im  on it.item_id = im.item_id WHERE (it.categoryALL = ? or it.subcategory = ?) and im.image_order = 1 and im.type = 'thumbnail';"
                    ,[selectedCategory,selectedCategory]
                )

            }

            console.log('✅특정 상품 목록 불러오기 완료');
            // console.log(items[0])

            res.json(items[0]);
            
            
        }catch(error){
            console.log('❌특정 상품 목록 불러오기 실패');
            console.log(error);
            res.status(500).json({
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
            var [item, _item] = await pool.query(
            `SELECT * FROM item WHERE item_id = ${itemId}`
            )
            console.log(item);

            const [thumbs,_thumbs] = await pool.query(
                'SELECT url FROM item_image WHERE item_id = ? and type = ? ORDER BY image_order',
                [itemId, 'thumbnail']
            )

            const [details, _details] = await pool.query(
                'SELECT url FROM item_image WHERE item_id = ? and type = ? ORDER BY image_order',
                [itemId, 'detail']
            )

            const [colorList, _colorList] =  await pool.query('SELECT value FROM colors WHERE item_id =?', [itemId]);
            const [optionList, _optionList] =  await pool.query('SELECT value FROM options WHERE item_id =?', [itemId]);

            console.log(colorList);
            console.log(optionList);
            console.log(thumbs);
            console.log(details);

            const thumbUrls = [];
            const detailUrls = [];
            const colors = ['(필수) 선택해주세요'];
            const options = [];

            
            thumbs.forEach((thumb)=>{
                thumbUrls.push(thumb['url'])
            })
            details.forEach((detail)=>{
                detailUrls.push(detail['url'])
            })
            colorList.forEach((detail)=>{
                colors.push(detail['value'])
            })
            optionList.forEach((detail)=>{
                options.push(detail['value'])
            })

            item = item[0]
            item['thumbUrls'] = thumbUrls
            item['detailUrls'] = detailUrls
            item['colors'] = colors
            item['options'] = options

            console.log('✅특정 상품 목록 불러오기 완료');

            res.json(item)

        }catch(error){
            console.log('❌특정 상품 목록 불러오기 실패');
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
        console.log(item);
        var title = item['title'];
        var price = item['price']; // 정수로 변경해야 함
        var colors = item['colors']; 
        var options = item['options']; 
        var mainCategory = item['mainCategory'];
        var subCategory = item['subCategory'];
        var keywords = item['keywords'];
        var thumbUrls = item['thumbUrls'];
        var detailUrls = item['detailUrls'];

        // 데이터 전처리
        price = parseInt(price);

        // item 쿼리 오류 발생시 멈춤
        // item은 성공하고 thumbnail나 detailImages 작업 중 오류 발생 시 이미 등록된 item, thumbnail삭제
        // 현재 i 이전에 등록된 이미지들에 대해서는 item을 삭제하면 같이 삭제되서 처리할 필요 없음
        // result가 반환한 insertId 에 대해서 colors와 options 테이블에도 데이터 삽입
        
        let insertId;
        try{
            const [result,_result] = await pool.query(
                'INSERT INTO item (title, price, maincategory, subcategory, keywords) VALUES (?,?,?,?,?)',
                [title, price, mainCategory, subCategory, keywords]
            );
    
            insertId = result.insertId;
    
            const insertImage = (type, urls)=>
                Promise.all(urls.map((url, i)=>
                    pool.query(
                        'INSERT INTO item_image (item_id, type, image_order, url) VALUES (?,?,?,?)',
                        [insertId, type, i+1, url]
                    )
                ));

            const insertData = (table, values)=>
                Promise.all(values.map((value, i)=>
                    pool.query(
                        `INSERT INTO ${table} (item_id, value) VALUES (?,?)`,
                        [insertId, value]
                    )
                )
            );
    
            await insertImage('thumbnail', thumbUrls);
            await insertImage('detail', detailUrls);
            await insertData('colors',colors);
            await insertData('options',options);

            console.log('✅특정 상품 등록 완료');
    
            res.json({
                result : "done",
                message : "new item emitted successfully",
                code : 0,
                itemId: insertId
            })
        }catch(error){
            console.log('❌특정 상품 등록 실패');
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
    
        // 3. 아이템 업데이트
        let isItemUpdated = false; // item 테이블의 상품이 수정되었는지 여부
        let isImageInserted = false; // 새로운 이미지가 삽입되었는지 여부 
        let isDataInserted = true; // 새로운 옵션 + 색상이 삽입되었는지 여부
        let isImageDeleted = false; // 기존의 이미지들이 삭제되었는지 여부
        try{
            const [itemUpdateResult, _itemUpdateResult] = await pool.query(
                'UPDATE item SET title = ?, price = ?, maincategory =? , subcategory = ?, keywords = ? WHERE item_id = ?',
                [title, price, mainCategory, subCategory, keywords, itemId]
            )
            isItemUpdated = true;
            console.log('⚙️상품 정보 업로드 결과:', isItemUpdated);
            // 이상적인 방향
            // 1. 아이템 수정
            // 2. 추가된 이미지 등록
            // 3. 추가된 옵션 등록
            // 4. 완료 시 현재 시긴기준 15초 바깥의 이미지 + 옵션 삭제

            // 이미지 등록 함수
            const insertImage = (type, urls)=>
                Promise.all(urls.map((url, i)=>
                    pool.query(
                        'INSERT INTO item_image (item_id, type, image_order, url) VALUES (?,?,?,?)',
                        [itemId, type, i+1, url]
                    )
                ));

            const insertData = (table, values)=>
                Promise.all(values.map((value)=>
                    pool.query(
                        `INSERT INTO ${table} (item_id, value) VALUES (?,?)`,
                        [itemId, value]
                    )
                )
            );

            if(isItemUpdated){
                await insertImage('thumbnail', thumbUrls);
                await insertImage('detail', detailUrls);
                await insertData('colors', colors)
                await insertData('options', options);
                isDataInserted = true;
                isImageInserted = true;
            }else{
                throw(error());
            }
            console.log('⚙️ 옵션 등록 결과 : ', isDataInserted);
            console.log('⚙️ 이미지 등록 결과 : ', isImageInserted);
            
            if(isDataInserted && isImageInserted){
                // 이미지 삭제 함수
                const thumbDeleteResult = await pool.query('DELETE FROM item_image WHERE item_id = ? AND type = "thumbnail" AND created_at < NOW() - INTERVAL 15 SECOND', [itemId]);
                const detailDeleteResult = await pool.query('DELETE FROM item_image WHERE item_id = ? AND type = "detail" AND created_at < NOW() - INTERVAL 15 SECOND', [itemId]);
                // 옵션 삭제 함수
                const colorsDeleteResult = await pool.query('DELETE FROM colors WHERE item_id = ? AND created_at < NOW() - INTERVAL 15 SECOND', [itemId])
                const optionsDeleteResult = await pool.query('DELETE FROM options WHERE item_id = ? AND created_at < NOW() - INTERVAL 15 SECOND', [itemId])
            }
            
            isImageDeleted = true

            console.log('✅특정 상품 수정 완료');

            res.json({
                result :'done',
                message : "item updated Successfully",
                code : 0,
                itemId : itemId
            })

        }catch(error){
            console.log('❌특정 상품 수정 실패');
            console.log(error)

            if(!isItemUpdated){
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

    delete_item : async(req, res)=>{
        var itemId = req.params.itemId;

        try{
            await pool.query(`DELETE from item WHERE item_id = ${itemId}`);

            console.log('✅특정 상품 삭제 완료');
            res.json({
                "result" : "item deleted successfully"  
            })
        }catch(e){
            console.log('❌특정 상품 삭제 실패');
            console.log(e);
            res.status(500).json({
                result : 'error occured',
                error : e
            })
        }

        // pool.query(`DELETE FROM item WHERE item_id=${itemId}`, (error, result)=>{
        //     if(error){
        //         console.log(error)
        //         res.status(500).json({
        //             "result" : "error occured",
        //             "error" : error
        //         })
        //     }else{
        //         res.json({
        //             "result" : "item deleted successfully"  
        //         })
        //     }
        // })
    },

    search_items: async (req, res)=>{
        var keywords = req.params.keywords;
        console.log(keywords);

        try{
            const [items, _items] = await pool.query(
                `select it.title as title,it.item_id as item_id, it.price as price, im.url as url from item it inner join item_image im  on it.item_id = im.item_id WHERE (it.title LIKE "%${keywords}%" or it.keywords LIKE "%${keywords}%") and im.image_order = 1 and im.type = "thumbnail"`
            )

            console.log('✅특정 상품 검색 완료');
            // console.log(items);

            res.json(items);
        }catch(error){
            console.log('❌특정 상품 검색 실패');
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