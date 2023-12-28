const express = require('express')
const mongoose = require('mongoose')
const Joi = require('joi')
const Campground=require('./models/campground')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')//engine used to parse ejs
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const {campgroundSchema} = require('./schemas.js')

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


const validateCampground = (req,res,next) =>{
    const {error} = campgroundSchema.validate(req.body)
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg,400)
    } else{
        next()
    }
}


app.get('/',(req,res)=>{
    res.render('home')//renders the home.ejs
})

app.get('/campgrounds',catchAsync(async (req,res)=>{
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index',{campgrounds})//campgrounds folder in views
}))

//ORDER MATTERS HERE
app.get('/campgrounds/new',(req,res)=>{
    res.render('campgrounds/new')
})
//WHEN ITS AFTER THE FINDBYID,IT TREATS "NEW" AS AN ID AND THROWS ERROR SINCE IT DOESN'T EXIST

app.post('/campgrounds',validateCampground, catchAsync(async(req,res,next)=>{
    //if(!req.body.campground) throw new ExpressError('Invalid Campground Data',400)
    const campground = new Campground(req.body.campground)//cuz the parser(urlenconded shit) returns an object in which campground is the key fr the req values
    await campground.save()
    res.redirect(`/campgrounds/${campground._id}`)
    
}))

app.get('/campgrounds/:id',catchAsync(async (req,res)=>{
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show',{campground})

}))

app.get('/campgrounds/:id/edit',catchAsync(async (req,res)=>{
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit',{campground})
}))

app.put('/campgrounds/:id',validateCampground,catchAsync(async(req,res)=>{
    const {id} = req.params                          //req.body.campground cuz all are grouped under campground in ejs
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground})//spread expands the iterable
    res.redirect(`/campgrounds/${campground._id}`)

}))

app.delete('/campgrounds/:id', catchAsync(async (req,res)=>{
    const {id} = req.params
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
}))

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