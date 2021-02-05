const express= require("express")
const app= express()
const mongoose=require('mongoose')
const Articles=require('./Models/article.js')
const Users=require('./Models/users.js')

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
    Users.findOne({isLoggedIn:true},(err,result)=>{
        if (err){console.log(err)}
        if (!result){res.redirect('/login')}
        else{
        res.redirect('/homepage')}
    })
})

app.post('/',(req,res)=>{
    Users.findOne({username:req.body.username,password:req.body.password},(err,result)=>{
        if(!result){
            res.render('login',{cantFindAccount:"Account associated with username and password not found, please try again"})
            return;
        }
    })
    Users.findOneAndUpdate({username:req.body.username},{isLoggedIn:true}).then((data)=>{
        res.redirect('/')
    })
})

app.get('/login',(req,res)=>{
    res.render('login',{cantFindAccount:""})
})
app.get('/homepage',(req,res)=>{
    Articles.find({}).then(articlesDB=>{
        const articles=articlesDB.map(m=>m);
        res.render('index',{articles:articles})
    })
    
})

app.get('/register',(req,res)=>{
    res.render('register',{userError:"",passwordError:""})
})
app.post('/createAccount',(req,res)=>{
    if(req.body.newPassword!=req.body.confirmPassword){
        res.render('register',{userError:"",passwordError:"Please confirm password"})
        return
    }
    Users.findOne({username:req.body.newUsername},(err,result)=>{
        if(result){
            res.render('register',{userError:"Username already in use",passwordError:""})
            return;
        }
    }) 
    let newUser= new Users({
        username:req.body.newUsername,
        password:req.body.newPassword,
        isLoggedIn:true
    })
    newUser.save().then(()=>{
     
        res.redirect('/')
    })
})
app.get('/deleteAll',(req,res)=>{
    Articles.deleteMany({}).then(()=>{res.redirect('/')})
})
app.get('/logOut',(req,res)=>{
    Users.findOneAndUpdate({isLoggedIn:true},{isLoggedIn:false}).then(()=>{
        res.redirect('/')})

})
app.delete('/homepage/:id', (req, res) => {
    Articles.findByIdAndDelete(req.params.id).then(()=>{res.redirect('/homepage')})
    Articles.find
    });

app.get('/edit/:id',(req,res)=>{
    Articles.findById(req.params.id).then(article=>{
        res.render('edit',{article:article})
    })


})

app.put('/homepage/:id',(req,res)=>{
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

app.post('/homepage/', (req,res)=>{

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