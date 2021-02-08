const path = require("path")
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
mongoose.set('useFindAndModify', false);
async function deleteAllArticles(){
await Articles.deleteMany({})
await Users.deleteMany({})
console.log(await Articles.find({}))
console.log(await Users.find({}))
}

app.get('/test',(req,res)=>{
    res.sendFile(path.join(__dirname, "reactviews/src", "index.html"));})

app.get('/',(req,res)=>{
    Users.findOne({isLoggedIn:true},(err,result)=>{
        if (err || !result){res.redirect('/login')}
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
        Users.findOne({isLoggedIn:true},(err,user)=>{
            res.render('index',{articles:articles,user:user})
        }).catch(err=>{res.redirect('/login')})
    }).catch(err=>{res.redirect('/login')})
    
    
})

app.get('/register',(req,res)=>{
    res.render('register',{userError:"",passwordError:""})
})
app.post('/createAccount',(req,res)=>{
    if(req.body.newPassword!=req.body.confirmPassword){
        res.render('register',{userError:"",passwordError:"Please confirm password"})
        return
    }
    let newUser= new Users({
        username:req.body.newUsername,
        password:req.body.newPassword,
        isLoggedIn:true
    })
    newUser.save().then(()=>{
     
        res.redirect('/')
    }).catch(err=>{
        res.render('register',{userError:"Username already in use",passwordError:""})
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

app.get('/show/:id',async (req,res)=>{
    let id=req.params.id
    let article=await Articles.findById(id)
    let user= await Users.findOne({isLoggedIn:true})
    res.render('show',{article:article,user:user})
})

app.post('/show/:id',(req,res)=>{
    
Users.findOne({isLoggedIn:true}).then( (user)=>{
    let id=req.params.id
Articles.findByIdAndUpdate(id,
     {"$push": {authorAtComment: user.username,comments:req.body.newComment}}
             
).then(article=>{
    
    res.redirect(`/show/${article.id}`)})

}).catch(err=>{console.log(err)})

})





app.post('/homepage/', async (req,res)=>{

    let article= new Articles({
        title: req.body.title,
        description:req.body.description,
        markdown:req.body.markdown,
        date: req.body.date
    })
   await Users.findOne({isLoggedIn:true},(err,result)=>{
        article.author=result.username;

    })
    try {
       article.save().then((savedArticle)=>{
        res.redirect(`/show/${savedArticle.id}`)

       }).catch((err)=>{console.log("save error")})
    }
    catch(error){
        console.log(error)
    }

})

app.get('/likeArticle/:id', async(req,res)=>{
let id=req.params.id
let article=await Articles.findById(id)
let user=await Users.findOne({isLoggedIn:true})
if (!article.likedBy.includes(user.username)){
    await Articles.findByIdAndUpdate(id,{$push:{likedBy:user.username}})
    
}
else{
   await Articles.findByIdAndUpdate(id,{$pull:{likedBy:user.username}})
 
}
    res.redirect(`/show/${id}`)
})

app.get('/follow/:id/:author/:username',async (req,res)=>{
    let author=req.params.author
    let user=await Users.findOne({isLoggedIn:true})
  if (!user.following.includes(author)){
     
    await Users.findOneAndUpdate({isLoggedIn:true},{$push:{following:author}},{new:true})
    
    await Users.findOneAndUpdate({username:author},{$push:{followers:user.username}},{new:true})
            
  }
  else{
    
    await Users.findOneAndUpdate({isLoggedIn:true},{$pull:{following:author}},{new:true})
    
    await Users.findOneAndUpdate({username:author},{$pull:{followers:user.username}},{new:true})

  }
   
    res.redirect(`/show/${req.params.id}`)
})