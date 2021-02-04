const express= require("express")
const app= express()
const mongoose=require('mongoose')
const Articles=require('./Models/article.js')
const bodyParser = require("body-parser");
const methodOverride = require('method-override');
app.use(methodOverride('_method'));


app.set('view engine','ejs')
app.listen(8080)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/blog', {
  useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true
})



app.get('/',(req,res)=>{
    Articles.find({}).then(articlesDB=>{
        const articles=articlesDB.map(m=>m);
        res.render('index',{articles:articles})
    })
    
})

app.get('/deleteAll',(req,res)=>{
    Articles.deleteMany({}).then(()=>{res.redirect('/')})
})

app.delete('/:id', (req, res) => {
    Articles.findByIdAndDelete(req.params.id).then(()=>{res.redirect('/')})
    Articles.find
    });

app.get('/edit/:id',(req,res)=>{
    Articles.findById(req.params.id).then(article=>{
        res.render('edit',{article:article})
    })


})

app.put('/:id',(req,res)=>{
    let id=req.params.id;
   Articles.findByIdAndUpdate(id,
    {title:req.body.title, description:req.body.description, date: Date.now(), markdown:req.body.markdown})
    .then(()=>{res.redirect(`/show/${id}`)}).catch(err=>{console.log(err)})
})

app.get('/newArticle',(req,res)=>{
    res.render('newArticle',{article: new Articles()})
})
app.get('/show/:id',(req,res)=>{
    let id=req.params.id
Articles.findById(id).then(article=>{
    res.render('show',{article:article})
})

})

app.post('/', (req,res)=>{

    let article= new Articles({
        title: req.body.title,
        description:req.body.description,
        markdown:req.body.markdown,
        date: req.body.date
    })
    try {
       article.save().then((savedArticle)=>{
        res.redirect(`/show/${savedArticle.id}`)
       }).catch((err)=>{console.log(err)})
    }
    catch(error){
        console.log(error)
    }

})