if(process.env.NODE_ENV !== "production"){
    require('dotenv').config()
}


const express = require('express')
const mongoose = require('mongoose')
const Joi = require('joi')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')//engine used to parse ejs
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const localStrategy = require('passport-local')

const Campground=require('./models/campground')
const Review = require('./models/reviews')
const User = require('./models/user')

const {campgroundSchema,reviewSchema} = require('./schemas.js')
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')
const userRoutes = require('./routes/users')


mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp') //here, yelp-camp is the name of the db to access in mongosh

const db = mongoose.connection//next line is mongoose.connection.on/.off
db.on("error",console.error.bind(console,"connection error:"))
db.once("open",()=>{
    console.log("database connected")
})


const app = express()
const path =require('path')

app.engine('ejs',ejsMate)
app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))

app.use(express.urlencoded({extended:true}))//to parse the req-body when the forms is submitted
app.use(methodOverride('_method'));//to fake put,patch and delete requests
app.use(express.static(path.join(__dirname,'public')))//to be able to access the public directory; included in boilerplate


const sessionConfig = {
    secret: 'thisisasecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,//security
        expires: Date.now() + 1000*60*60*24*7,//in milliseconds
        maxAge: 1000*69*60*24*7
    }
}
app.use(session(sessionConfig))//needs to be present before passport.sess
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())//for persistent login sessions(to avoid loggin in on every req)
passport.use(new localStrategy(User.authenticate()))//this is a static method in psp-local-mongoose

passport.serializeUser(User.serializeUser())//storing and retrieving of 
passport.deserializeUser(User.deserializeUser())//info from sessions

//MIDDLEWARE TO USE FLASH -> NEEDS TO BE DEFINED BEFORE ANY ROUTE HANDLERS
//GLOBALLY ACCESSIBLE BY ANY TEMPLATE
app.use((req,res,next)=>{
    if(!['/login','/'].includes(req.originalUrl)){
        req.session.retturnTo = req.originalUrl
    }
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

// app.get('/fakeuser',async(req,res)=>{
//     const user = new User({email:'jbxdksb', username:'colt'})
//     const newUser = await User.register(user,'abcd')==>static method by pap-loc-mong
//     res.send(newUser)     ===> gives automatic salt and hashed psw
// })



// //******************* */
app.use('/campgrounds', campgroundRoutes)//path,router
app.use('/campgrounds/:id/reviews',reviewRoutes)
app.use('/',userRoutes)



//order matters- at the end when the path(/smtg) doesnt exist
app.all('*',(req,res,next)=>{
    //res.send("404!!!")
    next(new ExpressError('Page Not Found',404))
})

app.use((err,req,res,next)=>{
    const {statusCode = 500} = err
    if(!err.message) err.message = 'Something went wrong'
    res.status(statusCode).render('error',{err})
})

app.listen(3000, ()=>{
    console.log('listening on port 3000')
})