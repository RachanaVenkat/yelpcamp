const express = require('express')
const mongoose = require('mongoose')
const Campground=require('./models/campground')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')//engine used to parse ejs
const catchAsync = require('./utils/catchAsync')

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

app.post('/campgrounds',catchAsync(async(req,res,next)=>{
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

app.put('/campgrounds/:id',catchAsync(async(req,res)=>{
    const {id} = req.params                          //req.body.campground cuz all are grouped under campground in ejs
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground})//spread expands the iterable
    res.redirect(`/campgrounds/${campground._id}`)

}))

app.delete('/campgrounds/:id', catchAsync(async (req,res)=>{
    const {id} = req.params
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds')
}))

app.use((err,req,res,next)=>{
    res.send("smtg went wrong")
})

app.listen(3000, ()=>{
    console.log('listening on port 3000')
})