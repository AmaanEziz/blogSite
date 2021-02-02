const express= require("express")
const app= express()
const mongoose=require('mongoose')
const Articles=require('./Models/article.js')
const bodyParser = require("body-parser");

app.set('view engine','ejs')
app.listen(8080)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost/blog', {
  useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true
})

articles=[]
app.get('/',(req,res)=>{
    res.render('index',{articles: articles})
})
app.get('/newArticle',(req,res)=>{
    res.render('newArticle')
})
app.post('/', async(req,res)=>{

    const article= new Articles({
        title: req.body.title,
        description:req.body.description,
        markdown:req.body.markdown,
        date: req.body.date
    })
    try {
        article=await article.save();//This saves the data to the database
        res.redirect(`/${article.id}`)
    }
    catch(e){
        res.render('/newArticle')
    }
})
