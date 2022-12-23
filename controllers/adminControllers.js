const { response, render } = require('../app');
const session = require('express-session');
const productsHelpers = require('../helpers/productsHelpers');
const userHelpers = require('../helpers/userHelpers');
const BlockUserHelpers=require('../helpers/BlockUserHelpers');
const { getOrderSuccess } = require('./userControllers');
const adminDashbord =require ('../helpers/adminDashbord');
const { monthgraph } = require('../helpers/adminDashbord');
const couponHelper= require('../helpers/couponHelpers')



 const AdEmail="admin@gmail.com";
 const  AdPassword="222";


//admin login
const adminLogin=(req,res)=>{
  
  if(req.session.adminLogin){
   res.redirect('admin/admin-home')
  }else{
   
    res.render('admin/admin-Login');
  }
  
  

  
}
//admin login post
const postAdminLogin=(req,res)=>{
 console.log(req.body) 
 console.log('kkkkkkkkkkkkkk');

 const adminData={Email,Password}=req.body;
  console.log(adminData);
  if(AdEmail===Email&&AdPassword===Password){
    console.log('password mached');
    req.session.adminLogin=true;
    req.session.admin=adminData;
    
    res.redirect('/admin/admin-home')
  }else{

    res.redirect('/admin')
  }
  
    
  
   
  }

  const getAdminLogout=(req,res)=>{
    req.session.adminLogin=false;
    req.session.admin=null;
    console.log(req.session.admin,'____---------------------admin Logout---------------------');
    res.redirect('/admin');
  }
  
  




// admin home dasboard

 const adminHome=async(req, res)=> {
  if(req.session.adminLogin){
  let Dashboard= await  adminDashbord.findPymentDeteiles()
  console.log(Dashboard,'------codddddd---------------------');
  let mounthGraph= await adminDashbord.monthgraph()

  console.log(Dashboard,'*************dasbored',mounthGraph,'***********graph');
    res.render('admin/admin-home',{layout:'admin-layout',admin:true,Dashboard,mounthGraph});
  }else{
    res.redirect('/admin')
  }
    
  };
  
  // product List

const productsList =(req,res)=>{
  productsHelpers.getAllproducts().then((products)=>{
    console.log(products);
    res.render('admin/products-list',{layout:'admin-layout',admin:true,products});
  })

    
}

//product add 

const getaddProducts = (req,res)=>{
  productsHelpers.getAllCategory().then((categoryDt)=>{

    res.render('admin/add-products',{layout:'admin-layout',admin:true,categoryDt});
  })
    
}
// post add products
const postAddProducts= (req,res)=>{
 
  
  productsHelpers.addProduct(req.body,(id)=>{
   
    let image=req.files.image
    let image1=req.files.image1
    let image2=req.files.image2
    let image3=req.files.image3
    console.log('id'+id);
    image.mv('./public/product-images/'+id+'.png',(err,done)=>{
      image1.mv('./public/product-images1/'+id+'.png',(err,done)=>{
        image2.mv('./public/product-images2/'+id+'.png',(err,done)=>{
          image3.mv('./public/product-images3/'+id+'.png',(err,done)=>{

          })
        })
      })
      if(!err){
        res.redirect('/admin/add-products')
      }else{
        console.log(err)
      }
    })
    
    
  })
  
}

// get delete
const getDelete=(req,res)=>{

  let proId=req.params.id
  console.log(proId);
  
  productsHelpers.DeleteProduct(proId).then((response)=>{

    res.redirect('/admin/products-list')
  })

}

// get product edit 

const getEdit=async(req,res)=>{
  // let proId =req.query.id
  // console.log(proId);
  let product=await productsHelpers.getProductDetails(req.query.id)

  res.render('admin/edite-products',{layout:'admin-layout',admin:true,product})
  
}
// post edit products

const postEdit=(req,res)=>{
    let id=req.params.id
   productsHelpers.updateProduct(req.params.id,req.body).then(()=>{
    res.redirect('/admin/products-list')
    if(req.files?.image){
      let image=req.files.image
      

      image.mv('./public/product-images/'+id+'.png')
    }else if(req.files?.image1){
      let image1=req.files.image1
      
      image1.mv('./public/product-images1/'+id+'.png')

    }else if(req.files?.image2){
      let image2=req.files.image2
      image2.mv('./public/product-images2/'+id+'.png')

    }else if(req.files?.image3){
      let image3=req.files?.image3
      image3.mv('./public/product-images3/'+id+'.png')

    }
   })

}
// get  user list  

const getUserList=(req,res)=>{

  BlockUserHelpers.getAllUsers().then((userData)=>{

       console.log(userData,'jkhkhkhkhkhkkhk');
       res.render('admin/user-list',{layout:'admin-layout',admin:true,userData})

    })
  
  
}

//get user block 

const getUserBlock=(req,res)=>{

  BlockUserHelpers.blockUser(req.query.id).then((response)=>{
    
    // console.log(response,'gggggggggggggg');
    

    res.redirect('/admin/user-list')

  })


}
// get use unblock

const getUserUnBlock=(req,res)=>{
  BlockUserHelpers.UnblockUser(req.query.id).then((response)=>{
    res.redirect('/admin/user-list')

    
  })
}
//get category

const getCategory=(req,res)=>{

  productsHelpers.getAllCategory().then((categoryDt)=>{

    console.log(categoryDt);

     
    res.render('admin/Category',{layout:'admin-layout',admin:true,categoryDt})
  })
  
}
//get add category
const getAddCategory=(req,res)=>{

  res.render('admin/add-Category')
  
}
// post add category
const postAddCategory=(req,res)=>{

  productsHelpers.addCategory(req.body).then((id)=>{
    console.log(id);
    let Catetoryimage=req.files.image
    Catetoryimage.mv('./public/category-image/'+id+'.png',(err,done)=>{
      if(!err){
        res.redirect('/admin/category')
      }else{
        console.log(err)
      }
    })
  })
    
  

}
// get order

const getOrder=async(req,res)=>{

    let orders=await userHelpers.getadminOrders()

    res.render('admin/order-managment',{layout:'admin-layout',admin:true,orders})

  //   const getMyOrders=async(req,res)=>{
  //     console.log('looooooooooooooog order');
  //     console.log(req.session.user);
  //     let orders=await userHelper.getUserOrders(req.session.user._id)
  //     res.render('user/my-orders',{user:req.session.user,orders})
  // }

}
const getProductView=async(req,res)=>{

        console.log(req.params.id,"paaaaaaaaaraaaaaaaaaaaamssssssssssss"); 
        
         let products= await userHelpers.getViewOrdeProducts(req.params.id)
         console.log(products,'*************kiiiikikikikik***********');
         
          res.render('admin/order-product-view',{products})
         
          
}
const postProductStatusChange=(req,res)=>{
  console.log('dtaaaaaaaaaaaaaaaa');
  let data=req.body

  console.log(data,'dataffffffffffffffaaaaaaaaaaaaa')

      userHelpers.changeProductStatus(data).then((response)=>{
        res.json(response)
      })

}
 const getCoupon=async(req,res)=>{

  let coupons=await  couponHelper.veiwCoupons()
    console.log(coupons,'d******************couponsssssssssssssssss');

    res.render('admin/coupon',{layout:'admin-layout',admin:true,coupons})
 }

const createCoupon=(req,res)=>{
  
  res.render('admin/create-coupon')
}

const postCreateCoupon=(req,res)=>{

  

  
  console.log(req.body,'***********datacoupon');

  couponHelper.createCoupon(req.body).then((response)=>{

    if(response.status){
      res.redirect('/admin/add-coupon')
    }else{
      res.redirect('/admin/coupon')
    }
    
  })


}

const getReport=(req,res)=>{
  console.log('report***********');


  res.render('admin/sales-report',{layout:'admin-layout',admin:true})

}

const postSalesReport=async(req,res)=>{

  console.log(req.body,'date form  To date ');
//  let fromDate=req.body.from-date
//  let toDate=req.body.to-date
    let sales=await adminDashbord.salesReport(req.body)
  
    res.render('admin/sales-report',{layout:'admin-layout',admin:true,sales})

}

//banner
const getBanner=(req,res)=>{
 
  res.render('admin/banner',{layout:'admin-layout',admin:true})
}
// post banner

const postBanner=(req,res)=>{

  console.log(req.body,'*************banner');

  productsHelpers.banner(req.body).then((id)=>{
                                                                                        
    let image=req.files.image
    let image1=req.files.image1
    console.log(req.body,'banner bodyyyyyyyyyyyyyyyyyyyyyy');
     
    image.mv('./public/banner-image/'+id+'.png',(err,done)=>{
      image1.mv('./public/banner-image1/'+id+'.png',(err,done)=>{
      
        if(!err){
         res.redirect('/admin/banner')
        }else{
          console.log(err);
        }
      })
    })

  })
   
    
}
const bannersView=async(req,res)=>{

 let banner=await productsHelpers.bannersfind()
 console.log(banner,'-------------------------');
 res.render('admin/banner-view',{layout:'admin-layout',admin:true,banner})
}

module.exports={
 getaddProducts,productsList,adminHome,postAddProducts,getDelete,
 getEdit,postEdit,getUserList,getUserBlock,getUserUnBlock,getCategory,getAddCategory,postAddCategory,adminLogin,
 postAdminLogin,getAdminLogout,getOrder,getProductView,postProductStatusChange,getCoupon,createCoupon,postCreateCoupon,
 getReport,postSalesReport,getBanner,postBanner,bannersView
}