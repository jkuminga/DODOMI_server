module.exports = {
    home : (req, res)=>{
        var context = {
            new : 'new'
        }

        res.render('main', context, (err, html)=>{
            res.end(html);
        })

    }
}