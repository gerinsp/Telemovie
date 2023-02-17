const route = (app) => {
    app.get('/', (req, res) => {
        res.render('index', { title: 'Party Room' })
    });
 
}

module.exports = route;