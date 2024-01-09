//DB objects of the schema in campground.js are created here by linking it to mongoose

//use node seeds/index.js to run
const mongoose = require('mongoose')
const Campground=require('../models/campground') //(..) cuz the campground file is other folder
const cities = require('./cities')
const {places,descriptors} = require('./seedHelpers')//array of elements each

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp') //here, yelp-camp is the name of the db to access in mongosh

const db = mongoose.connection//next line is mongoose.connection.on/.off
db.on("error",console.error.bind(console,"connection error:"))
db.once("open",()=>{
    console.log("database connected")
})

const sample = array => array[Math.floor(Math.random()*array.length)]

const seedDB = async()=>{
    await Campground.deleteMany({})
    for(let i=0; i<50;i++){
        const random1000 = Math.floor(Math.random()*1000)
        const price = Math.floor(Math.random()*25000)+100
        const camp = new Campground({
            author: '65952441492ee2d5419abdef',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title:`${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quae, qui expedita libero, tempora suscipit in ad laboriosam laudantium tempore autem placeat quas aperiam nobis veritatis dolor et fugiat consequatur magni.',
            price,
            images: [
                {
                  url: 'https://res.cloudinary.com/dvi8mxgpw/image/upload/v1704723398/yelpcamp/v9lsyw1nze0ypccjdvrd.png',
                  filename: 'yelpcamp/v9lsyw1nze0ypccjdvrd'
                },
                {
                  url: 'https://res.cloudinary.com/dvi8mxgpw/image/upload/v1704723398/yelpcamp/u9o5bjqqjnvskzgwhfiu.png',
                  filename: 'yelpcamp/u9o5bjqqjnvskzgwhfiu'
                }
              ]
        })
        await camp.save()
    }
}
seedDB().then(()=>{//automatic closing of db
    mongoose.connection.close()
})