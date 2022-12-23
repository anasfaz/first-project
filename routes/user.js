var express = require('express');
var router = express.Router();
const {verifyLogin} = require('../middlewares/verify')

const {userHome,getLogin,getSignUp,postSignUp,postLogin,getLogout,getCart,getProductDetailes,getAddCart,postProductQuantity,
    getPlaceOrder,postPlaceOrderdetiles,getOrderSuccess,
    getMyAccount,getMyOrders,getViewOrdeProducts,verifyPaymentRazorpay,getOtpPage,postOtp,getConfirmOtp,postConfirmOtp,
    postProductCancel,getUserDetails,postUserEdit,removeProductCart,postAddAddress,getAllProductsPage,getWishlist,postCoupon,
    paymentFailed,getAddToWishlist,postRemoveWishlist}=require('../controllers/userControllers');
const userHelpers = require('../helpers/userHelpers');
const { payment } = require('paypal-rest-sdk');
// const { getAddCategory } = require('../controllers/adminControllers');


/* GET home page. */
router.get('/',userHome) ;

//get login
router.get('/login',getLogin);

//post login
router.post('/login',postLogin)
// get logout
router.get('/logout',getLogout)
//get signup
router.get('/signup',getSignUp);
//post singUp
router.post('/signup',postSignUp);

// all products page 
router.get('/products-page',getAllProductsPage)

//get cart
router.get('/cart',verifyLogin,getCart);
// get add to cart 
router.get('/add-Cart/:id',getAddCart);
// get products details
router.get('/products-detailes',getProductDetailes)
/// post change product quantity
router.post('/change-product-quantity',postProductQuantity)

router.post('/remove-product',removeProductCart)

/// post add new address 

router.post('/add-adddress',postAddAddress);

// get place Order 

router.get('/place-order',verifyLogin,getPlaceOrder);

// get place order 

router.post('/place-order',postPlaceOrderdetiles)

// get order success

router.get('/order-success',getOrderSuccess);

/// get  my account 

router.get('/my-account',getMyAccount);
///order  list page 
router.get('/orders',getMyOrders);

// view order products page

router.get('/view-order-products/:id',getViewOrdeProducts)

//post  razorPay verifyPayment 

router.post('/verify-payment',verifyPaymentRazorpay)

/// get Otp pages

router.get('/Otp-page',getOtpPage);

// post OTP pages

router.post('/otp',postOtp);

// get otp confirm 

router.get('/confirm-otp',getConfirmOtp)

// post otp confir
router.post('/otp-confirmDigit',postConfirmOtp)

// product cancel 

router.post('/product-cancel',postProductCancel)

//get user detils page 

router.get('/user-account',getUserDetails)

// user Update  

router.post('/user-update/:id',postUserEdit)

///wishlist 

router.get('/wishlist',verifyLogin,getWishlist)


//  coupon apply

router.post('/apply-coupon',postCoupon)

// payment faild 

router.get('/pyment-failed/:id',paymentFailed)

// add to whishlist 

router.get('/add-wishlist/:id',getAddToWishlist)

//remove products wishlist

router.post('/remove-wishlist',postRemoveWishlist)


module.exports = router;
