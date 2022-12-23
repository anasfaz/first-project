module.exports={
    verifyLogin: (req,res,next)=>{
        
        if( req.session.loggedIn){
              next();
        }else{
            console.log("mmmmmmmmmmmmmmmmmmmmmmmmmmmm",req.session.loggedIn);
            res.redirect('/login');
        }
    }
}