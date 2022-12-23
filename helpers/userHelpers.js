var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
const { response } = require('express')
var objectId = require('mongodb').ObjectId
// const otp = require('../config/OTP')
require('dotenv').config();
const Client = require('twilio')(process.env.accountSID, process.env.authToken)

var Razorpay = require('razorpay')
// const { resolve } = require('path')
// const { rejects } = require('assert')
// const OTP = require('../config/OTP')
const { ObjectID } = require('bson')

const moment = require('moment');
const { defaultFormat } = require('moment')


var instance = new Razorpay({
    key_id: 'rzp_test_pQmt3rrvi9ODa0',
    key_secret: '26UDy7kToGkVBSswm3vOIoAD',
});


module.exports = {

    doSignup: (userData) => {

        return new Promise(async (resolve, reject) => {
            userData.password = await bcrypt.hash(userData.password, 10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                resolve(data.insertedId)
            })

        })


    },


    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            if (user) {
                console.log(user);
                bcrypt.compare(userData.password, user.password).then((status) => {

                    if (status) {
                        console.log(user)
                        console.log("login success");
                        response.user = user
                        response.status = true
                        resolve(response)
                    } else {
                        console.log("login filed");
                        resolve({ status: false })
                    }

                })

            } else {
                console.log('not founded the email');
                resolve({ status: false })
            }
        })

    },
    /// products detailes 
    productsDetailes: (Id) => {
        console.log('ethiyo iddddddddddddddddddddddddddddddd mone');
        console.log(Id)
        return new Promise(async (resolve, reject) => {
            let singleproducts = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(Id) })
            resolve(singleproducts)
            console.log(singleproducts, '//////////////////////////////////////mskidisw');
        })
    },

    // add to cart  products

    addToCart: (productId, userId) => {
        return new Promise(async (resolve, reject) => {
            let detailes = await db.get().collection(collection.PRODUCT_COLLECTION).find({ _id: objectId(productId) }).toArray()
            console.log(detailes, 'products**************add cart');

            let proObj = {
                item: objectId(productId),
                quantity: 1,
                productName: detailes[0].Name,
                productCategory: detailes[0].category,
                productPrice: detailes[0].Price

            }



            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == productId)
                console.log(proExist);
                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: objectId(userId), 'products.item': objectId(productId) },
                            {
                                $inc: { 'products.$.quantity': 1 }
                            }
                        ).then(() => {
                            resolve()
                        })
                } else {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId) },


                        {
                            $push: { products: proObj }
                        }

                    ).then((response) => {

                        resolve()

                    })

                }



            } else {
                let cartObj = {
                    user: objectId(userId),
                    products: [proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    console.log(response, 'responseeeeeeeeeeeeeeeeeeeeeeeeeeeeee');
                    resolve();
                })
            }
        })
    },
    //// add to cart

    getCartProducts: (userId) => {
        console.log(userId, 'kiiiiiiiiiiiiii');
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }




            ]).toArray()

            console.log(cartItems);
            resolve(cartItems)

        })

    },

    //get cart products count 
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0;
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            console.log(cart, 'kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkeeeeeeeeeeeeeeeeeeeeeeeeeeeee');
            if (cart) {
                count = cart.products.length


            }

            resolve(count)
        })
    },
    // post product quantity
    chageProductQuntity: (details) => {
        console.log(details);
        console.log('evide quantityyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyeviiiiiiiiiiideeeeeeeeee');
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)
        console.log(details.count);
        console.log(details.quantity)

        return new Promise(async (resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {
                console.log('counttttttttttttttttttttttttttttttttttppppppppppppppppppppppp')
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: objectId(details.cart) },
                        {
                            $pull: { products: { item: objectId(details.product) } }
                        }
                    ).then((response) => {
                        console.log(response);
                        resolve({ removeProduct: true })
                    })
            } else {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                        {
                            $inc: { 'products.$.quantity': details.count }
                        }
                    ).then((response) => {
                        resolve({ status: true })


                    })
            }

        })

    },

    removeCart: (data) => {
        console.log(data, 'cart88888888888888888888888888888');

        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION)
                .updateOne({ _id: objectId(data.cart) },
                    {
                        $pull: { products: { item: objectId(data.product) } }
                    }
                ).then((response) => {
                    console.log(response);
                    resolve({ removeProductfromCart: true })
                })
        })



    },

    /// get Total amount 
    getTotalAmount: (userId) => {
        console.log(userId, '///////////////////hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh////////////////');

        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', { '$toInt': '$product.Price' }] } }
                    }
                }




            ]).toArray()

            console.log(total, '***************total*********');
            resolve(total[0]?.total)

        })

    },

    ////// place order 
    placeOrder: (order, products, total, Address) => {

        return new Promise(async (resolve, reject) => {
            console.log(order, '************order**********');
            console.log(products, '*******%%%%%%%%%%%%%%%%%products');
            console.log(total, '$$$$$$$$$4$$$$$$$$$$$$$$$ totoal')


            let status = order['payment-method'] === 'COD' ? 'placed' : 'pending'
            products.forEach(products => {
                products.status = status
            });

            if (order.couponCode) {
                console.log('coupon collecgtion8888888888');
                await db.get().collection(collection.COUPON_COLLECTION).updateOne({ code: order.couponCode },
                    {
                        $push: {
                            Users: objectId(order.userId)
                        }
                    }
                )
            }






            let orderObj = {
                deliveryDetiles: {
                    name: Address[0].Name,
                    mobile: Address[0].phoneNo,
                    address: Address[0].Address,
                    pincode: Address[0].pincode,
                    state: Address[0].state,
                    city: Address[0].city,

                },
                userId: objectId(order.userId),
                paymentMethod: order['payment-method'],
                products: products,
                totalAmount: total,
                Odstatus: status,
                date: new Date(),
                orderDate: moment().format('YYYY-MM-D')

            }

            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                console.log(response);
                if (status == 'placed') {
                    db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectId(order.userId) })


                }
                resolve(response.insertedId)
                console.log(response.insertedId, '******IdInseted*******')

            })
        })
    },

    // get products list 

    getCartProductsaList: (userId) => {
        console.log('#############', 'getlist user');
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            console.log(response, '#############$$$$$$$$$$$$$$response');
            resolve(cart.products)

        })
    },
    // get user order

    getUserOrders: (userId) => {
        console.log(userId, 'userId*******************************');
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({ userId: objectId(userId) }).toArray()
            console.log(orders);
            resolve(orders)
        })
    },

    /////  get order view products

    getViewOrdeProducts: (orderId) => {
        console.log(orderId, '*******order**************************');
        // console.log(orderId._id, '***************************id****************')
        return new Promise(async (resolve, reject) => {
            let ordreItems = await db.get().collection(collection.ORDER_COLLECTION)
                .aggregate([
                    {
                        $match: { _id: objectId(orderId) }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            item: "$products.item",
                            quantity: '$products.quantity',
                            status: '$products.status'


                        }
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }


                    },
                    {
                        $project: {
                            item: 1,
                            quantity: 1,
                            status: 1,
                            product: { $arrayElemAt: ['$product', 0] }
                        }

                    }
                ]).toArray()
            console.log(ordreItems, "PPPPPPPPPPPPPPPPPPP")
            resolve(ordreItems)
        })
    },


    // Razorpay--------------------------------------------------------------------//

    generateRazorpay: (orderId, total) => {
        console.log(orderId);
        return new Promise((resolve, reject) => {
            var options = {
                amount: total,  // amount in the smallest currency unit
                currency: "INR",
                receipt: "" + orderId
            };
            instance.orders.create(options, function (err, order) {
                if (err) {
                    console.log(err, '5555555555555errror');
                } else {
                    console.log('new order :', order);
                    resolve(order)
                }

            });





        })
    },


    //verifyPayment razorpay
    verifyPayment: (details) => {
        console.log(details);
        return new Promise((resolve, reject) => {
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256', '26UDy7kToGkVBSswm3vOIoAD')

            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {
                resolve()
            } else {
                reject()
            }
        })
    },

    changePymentStatus: (orderId) => {
        console.log(orderId, 'ordeeeeerrrr');

        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: objectId(orderId) })
            db.get().collection(collection.ORDER_COLLECTION)
                .updateOne({ _id: objectId(orderId) },
                    {
                        $set: { 'products.$[].status': 'placed' }
                    }
                ).then(() => {
                    db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectId(user.userId) })
                    resolve()
                })
        })
    },
    /// do Otp 

    doOTP: (data) => {
        return new Promise(async (resolve, reject) => {
            console.log(data, '**************data**************');
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION)
                .findOne({ PhoneNumber: data.Phone })
            console.log(user, '********user*****');
            if (user) {
                response.status = true
                response.user = user
                Client.verify.services(process.env.serviceSID)
                    .verifications
                    .create({ to: `+91${data.Phone}`, channel: 'sms' })
                    .then((verifications) => {

                    });
                resolve(response)

            } else {
                response.status = false;
                resolve(response)
            }

        })


    },
    // post otp confirm
    doOTPconfirm: (otpData, userData) => {
        console.log(otpData, '$$$$$$$$$$otpdata');
        console.log(userData, '%%%%%%%%%userData');
        return new Promise((resolve, reject) => {
            console.log('deyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy');
            Client.verify.services(process.env.serviceSID)
                .verificationChecks
                .create({
                    to: `+91${userData.PhoneNumber}`,
                    code: otpData.Sixdigit
                }).then((data) => {
                    console.log(data, '********data otp*******');
                    if (data.status == 'approved') {
                        resolve({ status: true })

                    } else {
                        resolve({ status: false })

                    }
                })
        })
    },

    CancelProduct: (data) => {
        console.log(data, 'ggggggggggg');
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION)
                .updateOne({ _id: objectId(data.order), "products.item": objectId(data.product) },
                    {
                        $set: { "products.$.status": data.valueCancell }
                    }
                ).then((response) => {
                    console.log(response, 'canceStatus************')
                    resolve({ productCancel: true })
                })
        })
    },



    getadminOrders: () => {
        console.log('kiiiiiiiii');
        return new Promise(async (resolve, rejects) => {
            let order = await db.get().collection(collection.ORDER_COLLECTION).find().toArray()

            resolve(order)

            console.log(order, '********order********ddmin');
        })
    },

    // post product change status
    changeProductStatus: (data) => {

        console.log(data, 'dataaaaaaaaaaaaaaaaaa');
        let orderId = data.order
        let proId = data.product
        let value = data.valueChange


        return new Promise((resolve, rejects) => {
            db.get().collection(collection.ORDER_COLLECTION)
                .updateOne({ _id: ObjectID(orderId), "products.item": objectId(proId) },
                    {
                        $set: { "products.$.status": value }
                    }
                ).then((response) => {
                    resolve(response)
                })
        })


    },

    ///Account details

    userAccountDT: (data) => {

        console.log(data, 'user******************iddddddddddddd')
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(data) })


            resolve(user)
            console.log(user, '**********response user ')


        })





    },

    //update user   
    userUpdate: (userUpdate) => {
        let user = userUpdate._id
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(user) },
                {
                    $set: { Name: userUpdate.Name, PhoneNumber: userUpdate.PhoneNumber, email: userUpdate.email }
                }
            ).then((response) => {
                resolve(response)
                console.log(response, '*********response********');
            })
        })
    },



    // address 
    addAddress: (data) => {
        console.log(data, 'dta************');
        return new Promise((resolve, reject) => {
            let address = {
                Name: data.Name,
                DeliveryAddress: data.houseAddress,
                city: data.city,
                state: data.State,
                pinCode: data.Pincode,
                phoneNO: data.deliveryNo

            }
            address.addressId = new Date().valueOf() // added new field as with date value for editing address

            db.get().collection(collection.USER_COLLECTION)
                .updateOne({ _id: objectId(data.userId) }, { $push: { Address: address } }).then((response) => {

                })
            resolve()



        })
    },

    //find address 

    getaddress: (id) => {
        console.log(id, 'idddddddddddddddddddddddddddddddd');
        return new Promise(async (resolve, reject) => {

            let Address = await db.get().collection(collection.USER_COLLECTION).
                aggregate([
                    {
                        $match: { _id: objectId(id) }
                    },
                    {
                        $unwind: '$Address'
                    },
                    {
                        $project: {
                            _id: 0,
                            Address: '$Address'
                        }
                    }
                ]).toArray()

            resolve(Address)
            console.log(Address, 'ssssssssssssssssssssssssssss');

        })
    },

    findaddress: (userId, selectedAddressId) => {
        console.log(selectedAddressId, 'adresssss ********** ');

        selectedAddressId = parseInt(selectedAddressId)
        return new Promise(async (resolve, reject) => {

            let address = await db.get().collection(collection.USER_COLLECTION)
                .aggregate([
                    {
                        $match: { _id: objectId(userId) }
                    },

                    {
                        $unwind: '$Address'
                    },

                    {
                        $project: {
                            addressID: '$Address.addressId',
                            Name: '$Address.Name',
                            Address: '$Address.DeliveryAddress',
                            city: '$Address.city',
                            state: '$Address.state',
                            pincode: '$Address.pinCode',
                            phoneNo: '$Address.phoneNO'
                        }
                    },

                    {
                        $match: { addressID: selectedAddressId }


                    }
                ]).toArray()


            resolve(address)
            console.log(address, 'order*******address*******')

        })
    },

    //deleate cart payment errorr

    deleteorder: (id) => {

        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).deleteOne({ _id: objectId(id) })
        })

    },

    //wishlist 

    addToWishlist: (proId, userId) => {
        console.log('wishlist----------------------*******');
        return new Promise(async (resolve, reject) => {
            let response ={}
            let userWishlist = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({user:objectId(userId)})
            
            if(userWishlist){
                console.log(userWishlist,'wishlist**********')

                let proExist =userWishlist.products.findIndex(product => product == proId)
                console.log(proExist,'log--------------------');
                if(proExist != -1){
                    response.status =true
                    resolve(response)
                }else{
                    db.get().collection(collection.WISHLIST_COLLECTION).updateOne({user:objectId(userId)},
                    {
                        $push:{products:objectId(proId)}
                    }
                    ).then((response)=>{
                        response.status =true
                        resolve(response)
                    })
                }
            }else{
                let wishlistObj={
                    user:objectId(userId),
                    products:[objectId(proId)],
                }


                db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishlistObj).then((response)=>{
                    response.status= true
                    resolve(response)
                })
            }
            
        })







    },

    getWishlistProducts:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            
            let products = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                {
                    $match:{user:objectId(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'products',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                  $project:{
                    product:{$arrayElemAt:['$product',0]}
                  }
                }
            ]).toArray()
            resolve(products)
           

        })
    },

    removeWishlist:(data)=>{

        console.log(data,'dataaaaa');
        return new Promise((resolve,rejesct)=>{
            db.get().collection(collection.WISHLIST_COLLECTION)
            .updateOne({_id:objectId(data.wishlist)},
            {
                $pull:{products:objectId(data.product)}
            }).then((response)=>{
                console.log(response,'response-------------------');
                resolve({removeProductWishlist:true})
            })
        })

    }







}