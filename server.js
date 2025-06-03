if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const path = require('path')
const express = require('express')
const bcrypt = require('bcrypt')
const app = express()
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const initializePassport = require('./passport-config')

const users = []

const getUserByEmail = (email) => {
    return users.find(user => user.email === email)
}

const getUserById = (id) => {
    return users.find(user => user.id === id)
}

initializePassport(passport, getUserByEmail, getUserById)

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: false })) // parse application/x-www-form-urlencoded form data in req.body

app.use(flash())

// setting express-session middleware
app.use(session({
    secret: 'minha-chave-secreta-fixa', // string fixa para o secret
    resave: false,
    saveUninitialized: false,
}))


app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', (req, res) => {
    res.render('home.ejs');
})

// app.get('/login', checkAuthenticated, (req, res) => {
//     res.render('index.ejs', { name: req.user.name })
// })

app.get('/index', (req, res) => {
    res.render('index.ejs', { name: req.user.name });
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/index',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10) // hashing password
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
        })
        return res.redirect('/login')
    } catch {
        return res.redirect('/register')
    }
    console.log(users)
})

app.delete('/logout', (req, res, next) => {
    req.logOut((err) => {
        if(err){
            return next(err)
        }
        res.redirect('/login')
    })
})

// function checkAuthenticated(req, res, next){
//     if(req.isAuthenticated()){
//         return next(
//     }
//     res.redirect('/login')
// }

function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect('/index')
    }
    next();
}

app.listen(3000,()=>console.log('Listening on port:3000'))
