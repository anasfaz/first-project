const session = require('express-session');
// const { response, render } = require('../app');
var productHelper = require('../helpers/productsHelpers')
var userHelper = require('../helpers/userHelpers');
// const { verifyLogin } = require('../middlewares/verify');

const payPal = require('../helpers/payPal');
const couponHelpers = require('../helpers/couponHelpers');


const userHome = async (req, res) => {

    let user = req.session.user
    let Cartproducts =null
    let totalvalue = 0
   

   

   
    let cartCount = null


    if (req.session.user) {
        cartCount = await userHelper.getCartCount(req.session.user._id)
        console.log(cartCount,'cart count');
    }

    req.session.returnTo = req.originalUrl
 try {
    let products=await productHelper.getAllproducts()
        console.log(products);
     let banner=await productHelper.getbanner()
     console.log(banner,'*******************8banner');
     let category=await productHelper.getAllCategory()
     console.log(category,'---------------------');
        res.render('user/index', { User: true, products, user, cartCount,banner,category })
 } catch (error) {
    res.render('error')
 }
     
    


};
//get login
const getLogin = (req, res) => {

    if (req.session.loggedIn) {

        res.redirect('/')

    } else {


        res.render('user/Login', { 'loginErr': req.session.loginErr })
        req.session.loginErr = false


    }




}
//get logout
const getLogout = (req, res) => {

    req.session.loggedIn = false;
    req.session.user = null
    res.redirect('/')
}

//post login
const postLogin = (req, res) => {
    console.log(req.body);
    userHelper.doLogin(req.body).then((response) => {
        console.log(response, 'kjhkhkhkhkkh');
        if (response.status) {
            if (response.user.block) {
                console.log('looooogggg');

                res.redirect('/login')
            } else {
                req.session.loggedIn = true
                req.session.user = response.user
                res.redirect(req.session.returnTo)
            }

        } else {
            console.log(response);
            console.log('loginn kkkkkkkkkkkkkkkkkkkk');
            req.session.loginErr = true
            res.redirect('/login')
        }
    })

}
//get signUp
const getSignUp = (req, res) => {
    res.render('user/sign-Up')
}
//post signUP
const postSignUp = (req, res) => {
    console.log(req.body);
    userHelper.doSignup(req.body).then((response) => {
        // console.log(response);
        res.redirect('/login')
    })
}
//get cart
const getCart = async (req, res) => {
    let user = req.session.user
    console.log(user, '//////////////////?????????????????');
    console.log(req.session.user._id, 'rewwwwwwwwwwwwwwwwwwwwwwwwwww');

    let products = await userHelper.getCartProducts(req.session.user._id)
    let totalvalue = 0
    if (products.length > 0) {
        totalvalue = await userHelper.getTotalAmount(req.session.user._id)
    }
    let cartCount = null

    cartCount = await userHelper.getCartCount(req.session.user._id)
    console.log(cartCount);


    console.log(products, 'keeeeeeeeeeeeeeeeee');
    res.render('user/cart', { user, products, totalvalue, cartCount })
}
/// get product detailes
const getProductDetailes = async (req, res) => {
    req.session.returnTo = req.originalUrl
    let user = req.session.user
    cartCount = null
    if (req.session.user) {
        cartCount = await userHelper.getCartCount(req.session.user._id)
        console.log(cartCount);
    }
    console.log('kooiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii');
    userHelper.productsDetailes(req.query.id).then((singleProduct) => {
        res.render('user/single-product', { singleProduct, user, cartCount });
        console.log(singleProduct);

    })
}
// get add cart products
const getAddCart = (req, res) => {

    console.log('ethiyoooooooooooooooooooooooooooo iiiiiiiiiiiiiii');
    console.log(req.params.id);
    userHelper.addToCart(req.params.id, req.session.user._id).then(() => {

        res.json({ status: true })
    })

    // res.redirect('/')
}

const postProductQuantity = (req, res, next) => {



    console.log(req.body, 'body contentttttttttttttttttttttttt');


    userHelper.chageProductQuntity(req.body).then(async (response) => {
        response.total = await userHelper.getTotalAmount(req.body.user)
        res.json(response)
        console.log(response, "responseeeeee");
    })
}

//remove products  from cart

const removeProductCart = (req, res, next) => {

    userHelper.removeCart(req.body).then((response) => {
        res.json(response)
    })

}

// get place order:

const getPlaceOrder = async (req, res) => {

    console.log(req.session.user._id, '****************userId checkout**********');

    let total = await userHelper.getTotalAmount(req.session.user._id)

    let Address = await userHelper.getaddress(req.session.user._id)
    // console.log(address,'addresssssssssssssssssssssss');
    // let user = req.session.user
    res.render('user/checkout', { total, user: req.session.user, Address });
    // res.render('user/checkout',{total,user});

    // console.log(user,'user*************');
}
//post place Order 

const postPlaceOrderdetiles = async (req, res) => {
    console.log(req.body, '*******************placeOrderLog**************');
    let addressId = req.body.paymentAddress
    console.log(addressId, 'adressssssssssssssssssssssssssiddddddddddd');
    let products = await userHelper.getCartProductsaList(req.body.userId)
    let totalPrice = await userHelper.getTotalAmount(req.body.userId)
    let Address = await userHelper.findaddress(req.body.userId, addressId)
    console.log(Address, 'address  evideeeeeeeeeeeeeeeeeeeeeeeeevaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    let user = req.session.user

    let couponVerification = await couponHelpers.couponVerify(req.session.user._id)
    // console.log(couponVerify,'verifycoupon*********Loggggggggggggggggggg');

    if (couponVerification.code == req.body.couponCode) {

        let discountAmount = (totalPrice * parseInt(couponVerification.percentage)) / 100
        let amount = totalPrice - discountAmount

        console.log(amount, 'amount**********************');

        userHelper.placeOrder(req.body, products, amount, Address).then((orderId) => {

            console.log(orderId, '**********88order************')


            if (req.body['payment-method'] === 'COD') {
                res.json({ CodSuccess: true })
            } else if (req.body['payment-method'] === 'Razorpay') {

                userHelper.generateRazorpay(orderId, amount).then((response) => {
                    console.log(orderId, '************orderId**********');
                    console.log(response, '****************razoroay');
                    res.json(response)
                })

            } else if (req.body['payment-method'] === 'PayPal') {
                //   let   convertPrice= parseInt(totalPrice)
                var payment = {
                    "intent": "sale",
                    "payer": {
                        "payment_method": "paypal"
                    },
                    "redirect_urls": {
                        "return_url": "http://localhost:3000/order-success",
                        "cancel_url": "http://localhost:3000/file"
                    },
                    "transactions": [{
                        "amount": {
                            "currency": "USD",
                            "total": amount
                        },
                        "description": orderId
                    }]
                };

                payPal.createPaypal(payment).then((transaction) => {
                    var id = transaction.id;
                    var links = transaction.links;
                    var counter = links.length;
                    while (counter--) {
                        if (links[counter].method == 'REDIRECT') {
                            transaction.payPal = true
                            transaction.linkto = links[counter].href
                            transaction.orderId = orderId
                            userHelper.changePymentStatus(orderId).then(() => {
                                res.json(transaction)
                            })
                        }
                    }
                })



            }

        })
    } else {



        userHelper.placeOrder(req.body, products, totalPrice, Address).then((orderId) => {

            console.log(orderId, '**********88order************')


            if (req.body['payment-method'] === 'COD') {
                res.json({ CodSuccess: true })
            } else if (req.body['payment-method'] === 'Razorpay') {

                userHelper.generateRazorpay(orderId, totalPrice).then((response) => {
                    console.log(orderId, '************orderId**********');
                    console.log(response, '****************razoroay');
                    res.json(response)
                })

            } else if (req.body['payment-method'] === 'PayPal') {
                //   let   convertPrice= parseInt(totalPrice)
                var payment = {
                    "intent": "sale",
                    "payer": {
                        "payment_method": "paypal"
                    },
                    "redirect_urls": {
                        "return_url": "http://localhost:3000/order-success",
                        "cancel_url": "http://localhost:3000/pyment-failed/"+orderId
                    },
                    "transactions": [{
                        "amount": {
                            "currency": "USD",
                            "total": totalPrice
                        },
                        "description": orderId
                    }]
                };

                payPal.createPaypal(payment).then((transaction) => {
                    var id = transaction.id;
                    var links = transaction.links;
                    var counter = links.length;
                    while (counter--) {
                        if (links[counter].method == 'REDIRECT') {
                            transaction.payPal = true
                            transaction.linkto = links[counter].href
                            transaction.orderId = orderId
                            userHelper.changePymentStatus(orderId).then(() => {
                                res.json(transaction)
                            })
                        }
                    }
                })



            }

        })
    }
}
// get getOrderSuccess
const getOrderSuccess = (req, res) => {
    console.log('order successs    ')

    res.render('user/order-Success')
}
const getMyAccount = async(req, res) => {
    let user=req.session.user
    console.log(user,'my Accounttttttttttttttttttt')
   
    
    let cartCount = null
    if(user){
        cartCount = await userHelper.getCartCount(req.session.user._id)
    }
    res.render('user/my-account',{ user, cartCount })

}
///get my orders
const getMyOrders = async (req, res) => {
    console.log('looooooooooooooog order');
    console.log(req.session.user);
    let orders = await userHelper.getUserOrders(req.session.user._id)
    let user=req.session.user
    let cartCount = null
    if(user){
        cartCount = await userHelper.getCartCount(req.session.user._id)
    }
    res.render('user/my-orders', { user: req.session.user, orders,cartCount })
}
/// get view order view products

const getViewOrdeProducts = async (req, res) => {
    console.log(req.params.id, '*******************id((((params')
    let products = await userHelper.getViewOrdeProducts(req.params.id)
    let user=req.session.user
    console.log(user,'-----------------------------------------user naem-------------------------------------');
    let cartCount = null
    if(user){
        cartCount = await userHelper.getCartCount(req.session.user._id)
    }
    console.log(products, '$$$$$$$$$$$$$22@');
    res.render('user/view-order-products', { user: req.session.user, products,cartCount })
}

/// post razorPay verifyPayment

const verifyPaymentRazorpay = (req, res) => {
    console.log(req.body, 'dddddddddddddddddddddd');
    userHelper.verifyPayment(req.body).then(() => {
        userHelper.changePymentStatus(req.body['order[receipt]']).then(() => {
            console.log('pyment succesfull');
            res.json({ status: true })
        })
    }).catch((error) => {
        res.json({ status: false, errMsg: '' })
    })
}

const getOtpPage = (req, res) => {
    
    res.render('user/otp-page')
}
let otpSignData
const postOtp = (req, res) => {

    console.log(req.body, '*********************phone number ')
    userHelper.doOTP(req.body).then((response) => {
        console.log(response, '*********otp response************');
        if (response.status) {
            otpSignData = response.user
            res.redirect('/confirm-otp')

        } else {
            res.redirect('/otp')
        }

    })


}
/// get confirm OTP 
const getConfirmOtp = (req, res) => {
    console.log('confirm****************');
    res.render('user/confirm-otp')
}
// post confirm otp 
const postConfirmOtp = (req, res) => {
    console.log(req.body, '*********6digit*********');
    console.log(otpSignData, '**********otpsingup data');
    userHelper.doOTPconfirm(req.body, otpSignData).then((response) => {
        if (response.status) {
            console.log(response, "response**************");
            req.session.loggedIn = true;
            req.session.user = otpSignData

            res.redirect('/')
        } else {
            res.redirect('/confirm-otp')
        }
    })


}

// post products cancel
const postProductCancel = (req, res) => {

    console.log(req.body, 'content produict cancelled');


    userHelper.CancelProduct(req.body).then((response) => {
        console.log(response, "responseeeeeeeeee");
        res.json(response)
    })


}

const getUserDetails = async(req, res) => {
    let user = req.session.user
    
    
    let UserProfile=null
  
    let cartCount = null
    if(user){
        UserProfile=await  userHelper.userAccountDT(req.session.user._id)
        cartCount = await userHelper.getCartCount(req.session.user._id)
    }

        res.render('user/user-profile', {user, UserProfile ,cartCount})
        console.log(UserProfile, 'user***********profile');
    




}

// post edit user profile

const postUserEdit = (req, res) => {

    console.log(req.body, '**********updateCondent*****');

    userHelper.userUpdate(req.body).then((response) => {
     
        res.redirect('/user-account')
    })


}

//address post
const postAddAddress = async (req, res) => {
    console.log(req.body, '******address*********')

    await userHelper.addAddress(req.body).then(() => {
        res.redirect('/place-order')
    })

}

const getAllProductsPage = async(req, res) => {
    let user=req.session.user
    let products=await productHelper.getAllproducts()
    console.log(products,'******************product page');
    let cartCount = null
    if(user){
        cartCount = await userHelper.getCartCount(req.session.user._id)
    }
    req.session.returnTo = req.originalUrl
    res.render('user/products-Page',{products,user,cartCount})
}
const getWishlist = async(req, res) => {
    console.log('wishlist');
    let user=req.session.user
    let cartCount = null
    if(user){
        cartCount = await userHelper.getCartCount(req.session.user._id)
    }
    let products = await userHelper.getWishlistProducts(user._id)
    console.log(products,'products**********************');
    res.render('user/wishlist',{cartCount,user,products})
}

//coupon
const postCoupon = async (req, res) => {
    console.log(req.body, 'coupon**************');
    let user = req.session.user._id

    const date = new Date()

    let totalAmount = await userHelper.getTotalAmount(user)
    let Total = totalAmount

    console.log(Total, '***********');

    if (req.body.coupon == '') {
        res.json({ noCoupon: true })
    } else {
        let couponResponse = await couponHelpers.applycoupon(req.body, user, date, totalAmount)

        console.log(couponResponse, 'couponresponseeee');
        if (couponResponse.verify) {

            let discountAmount = (Total * parseInt(couponResponse.couponData.percentage)) / 100
            console.log(discountAmount, 'discounted price');
            let price = Total - discountAmount
            console.log('price,', price);
            couponResponse.discountAmount = Math.round(discountAmount)
            couponResponse.price = Math.round(price)
            res.json(couponResponse)
            console.log(couponResponse, 'send to ajax response');

        } else {
            couponResponse.Total = totalAmount

            res.json(couponResponse)
            console.log(couponResponse, 'response else send ajax');
        }
    }



}

const paymentFailed=(req,res)=>{
    console.log(req.params.id,"params faielddddddddddddddddddddddddddd")
    userHelper.deleteorder(req.params.id)
    
   res.render('user/payment-failed')

}

const getAddToWishlist=(req,res)=>{
    console.log('log------------');
    
        console.log('userin');
        console.log(req.params.id,'wishlist add product id')

        userHelper.addToWishlist(req.params.id,req.session.user._id).then((response)=>{
    
            res.json(response)
            console.log('response------------------',response);
    
        })
    
    
   


}

const postRemoveWishlist=(req,res)=>{
    console.log(req.body,'------------------');
    userHelper.removeWishlist(req.body).then((response)=>{
        res.json(response)
    })
}

module.exports = {
    userHome, getLogin, getSignUp, postSignUp, postLogin, getLogout, getCart, getProductDetailes,
    getAddCart, postProductQuantity, getPlaceOrder, postPlaceOrderdetiles, getOrderSuccess, getMyAccount,
    getMyOrders, getViewOrdeProducts, verifyPaymentRazorpay, getOtpPage, postOtp, getConfirmOtp, postConfirmOtp, postProductCancel,
    getUserDetails, postUserEdit, removeProductCart, postAddAddress, getAllProductsPage, getWishlist, postCoupon,paymentFailed,getAddToWishlist,
    postRemoveWishlist
}