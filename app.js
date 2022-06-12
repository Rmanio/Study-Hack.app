// noinspection JSVoidFunctionReturnValueUsed


const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const bodyparser = require("body-parser");
const path = require('path');
const moment = require('moment')
const Article = require('./server/models/article')
const articleRouter = require('./server/routes/articles')
const methodOverride = require('method-override')


const app = express();

app.locals.moment = moment;

const indexRouter = require('./server/routes/library')
const authorRouter = require('./server/routes/authors')
const bookRouter = require('./server/routes/books')
const {ensureAuthenticated} = require("./config/auth");




// Passport Config
require('./config/passport')(passport);

//DB Config
const db = require('./config/keys').MongoURI;

//Connect to Mongo
mongoose.connect(db,{useNewUrlParser: true})
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));




//EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');



//Bodyparser
app.use(express.static('public'))
app.use(bodyparser.urlencoded({limit: '10mb', extended : false}));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'))



//Express Session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

app.get('/blog', ensureAuthenticated, async (req, res) => {
    let articles = await Article.find().sort({ createdAt: 'desc' })
    const ADMIN = ['yzADMIN@admin.com', 'dnADMIN@admin.com', 'anADMIN@admin.com', 'akADMIN@admin.com'];
    res.render('articles/index', {
        admin: ADMIN,
        user:req.user,
        articles: articles
    })
})


// load assets || adding to the server
app.use('/css', express.static(path.resolve( "assets/css")))
app.use('/img', express.static(path.resolve( "assets/img")))
app.use('/js', express.static(path.resolve("assets/js")))
app.use('/fonts', express.static(path.resolve( "assets/fonts")))



// load routers
app.use('/', require('./server/routes/index'));
app.use('/users', require('./server/routes/users'));
app.use('/ADMIN', require('./server/routes/router'));
app.use('/articles', articleRouter);
app.use('/news',require('./server/routes/news'))
app.use('/library', indexRouter)
app.use('/authors', authorRouter)
app.use('/books', bookRouter)
app.use('/sources', require('./server/routes/sources'))






const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=> console.log(`Server started http://localhost:${PORT}`));
