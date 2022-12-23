module.exports={
    AdminverifyLogin: (req,res,next)=>{
        if( req.session.adminLogdIn){
            next();
        }else{
            res.redirect('/admin');
        }
    }

}