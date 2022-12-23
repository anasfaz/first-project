var express = require('express');
var router = express.Router();
const {AdminverifyLogin}=require('../middlewares/adminVerify')
 const{ getaddProducts,productsList,adminHome,postAddProducts,getDelete,getEdit,
    postEdit,getUserList,getUserBlock,getUserUnBlock,getCategory
    ,getAddCategory,postAddCategory,adminLogin,postAdminLogin,getAdminLogout,getOrder,
    getProductView,postProductStatusChange,getCoupon,createCoupon,postCreateCoupon,
    getReport,postSalesReport,getBanner,postBanner,bannersView}= require('../controllers/adminControllers');
const { getSignUp } = require('../controllers/userControllers');

/* GET users listing. */
router.get('/',adminLogin);

// admin login
router.get('/admin-home',adminHome);
/// admin login post
router.post('/login',postAdminLogin);
// logout admin

router.get('/logout',getAdminLogout);
// products page

router.get('/products-list',productsList);


router.get('/add-products',getaddProducts);


//post products page

router.post('/add-products',postAddProducts);

//get product delete

router.get('/product-delete/:id',getDelete);

// get product edit

router.get('/product-edite/',getEdit);

// post edit products

router.post('/edite-products/:id',postEdit);

// get user list  

router.get('/user-list',getUserList);

// get user block

router.get('/user-block',getUserBlock);

//get user UnBlock  

router.get('/user-Unblock',getUserUnBlock);

// get category 
router.get('/category',getCategory);

// add get category
router.get('/add-Category',getAddCategory);

///post add category

router.post('/add-Category',postAddCategory)

// get order managment 

 router.get('/order-managment',getOrder)

 // get order product view 

 router.get('/order-product-view/:id',getProductView)

 // post order status change

 router.post('/product-status',postProductStatusChange)

 // get coupon page 

 router.get('/coupon',getCoupon)

 // get add coupon 

 router.get('/add-coupon',createCoupon)

 //post create new coupon

 router.post('/create-coupon',postCreateCoupon)

 //get sales report page

 router.get('/sales-report',getReport)

 // post sales date 

 router.post('/sales-date',postSalesReport)

 // banner

 router.get('/banner',getBanner)

 //post banner

 router.post('/add-banner',postBanner)

 //banners view
 
 router.get('/banner-view',bannersView)

module.exports = router;
