const Campground=require('../models/campground')

module.exports.index = async (req,res)=>{
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index',{campgrounds})
}

module.exports.renderNewForm = (req,res)=>{
    res.render('campgrounds/new')
}

module.exports.createCampground = async(req,res,next)=>{
    //if(!req.body.campground) throw new ExpressError('Invalid Campground Data',400)
    const campground = new Campground(req.body.campground)//cuz the parser(urlenconded shit) returns an object in which campground is the key fr the req values
    campground.images = req.files.map(f=>({url: f.path, filename: f.filename}))
    campground.author = req.user._id//req.user from passport
    await campground.save()
    console.log(campground)
    req.flash('success','Successfully made a new campground!')
    res.redirect(`/campgrounds/${campground._id}`)
    
}

module.exports.showCampground = async (req,res)=>{
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',//pop all reviews on campground
        populate:{
            path: 'author'//pop author of each review on cpmgr
        }
    }).populate('author')
    if(!campground){
        req.flash('error','Campground doesnt exist')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show',{campground})

}

module.exports.renderEditForm = async (req,res)=>{
    const campground = await Campground.findById(req.params.id)
    if(!campground){
        req.flash('error','Campground doesnt exist')
        res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit',{campground})
}

module.exports.updateCampground = async(req,res)=>{
    const {id} = req.params   
    const campground = await Campground.findById(id)                       //req.body.campground cuz all are grouped under campground in ejs
    if(!campground){
        req.flash('error','Cannot find that campground')
        return res.redirect('/campgrounds')
    }
    const camp = await Campground.findByIdAndUpdate(id,{...req.body.campground})
    const imgs = req.files.map(f=>({url: f.path, filename: f.filename}))
    campground.images.push(...imgs)
    await campground.save()
    req.flash('success','Successfully updated the campground')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req,res)=>{
    const {id} = req.params
    await Campground.findByIdAndDelete(id)
    req.flash('success','Successfully deleted a campground')
    res.redirect('/campgrounds')
}