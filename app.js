const express = require('express');
const path = require('path')
const exphbs  = require('express-handlebars');
const methodOverride = require('method-override')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport')
const {estaAutenticado} = require('./helpers/auth')
const app = express();

//load routes
const ideas = require('./routes/ideas')
const users = require('./routes/users')

//passport config

require('./config/passport')(passport)

//Db config
const db = require('./config/database')

// Map global promise - get rid of warning
mongoose.Promise = global.Promise;
// Connect to mongoose
mongoose.connect(db.mongoURI,{useCreateIndex: true, useNewUrlParser: true})
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));


// Handlebars Middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//sstatic folder
app.use(express.static(path.join(__dirname,'public')));

// Method override middleware
app.use(methodOverride('_method'));

//express session middleware
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true,
}))

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

//variaveis globais

app.use(function(req, res, next){
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
})

// Index Route
app.get('/', (req, res) => {
  res.render('users/login')
});

app.get('/inicial', estaAutenticado,(req, res) => {
  const title = 'Bem Vindo';
  res.render('index', {
    title: title
  });
});

// About Route
app.get('/about', (req, res) => {
  const title = 'Sobre nós';
  res.render('about',{
    title: title
  });
});

//Use routes
app.use('/ideas',ideas);
app.use('/users',users);

const port = process.env.PORT || 5000;

app.listen(port, () =>{
  console.log(`Server started on port ${port}`);
});
