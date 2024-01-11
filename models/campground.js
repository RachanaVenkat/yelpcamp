const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Review = require('./reviews')

const imageSchema = new Schema({
    url: String,
    filename: String
})
//virtual is used to avoid making a copy of the already existing url, but is present virtually in db
imageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload','/upload/w_200')//reduces width to 200
})

const CampgroundSchema = new Schema({
    title:String,
    images:[imageSchema ],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price:Number,
    description:String,
    location:String,
    author:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

CampgroundSchema.post('findOneAndDelete', async function(doc){
    if(doc){
        await Review.deleteMany({
            _id:{
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground',CampgroundSchema)