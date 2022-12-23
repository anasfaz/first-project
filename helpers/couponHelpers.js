var db = require('../config/connection')
var collection = require('../config/collections');
const { response } = require('../app');
const { ObjectId } = require('mongodb');
var objectId = require('mongodb').ObjectId

module.exports = {

    createCoupon: (data) => {
        console.log(data, 'codeeeeeeeeeee');
        return new Promise(async (resolve, reject) => {

            //             let couponData={}
            //   couponData.name=req.body.CouponName
            //   couponData.code=req.body.CouponCode
            //   couponData.minAmount=req.body.minAmount
            //   couponData.expireDate=req.body.expireDate
            //   couponData.percentage=req.body.percentage

            let response = {}
            couponExisist = await db.get().collection(collection.COUPON_COLLECTION).findOne({ code: data.CouponCode })
            if (couponExisist) {

                response.status = true
                response.message = 'coupon already exisist'

                resolve(response)


            } else {
                await db.get().collection(collection.COUPON_COLLECTION)
                    .insertOne({ Name: data.CouponName, code: data.CouponCode, minAmount: data.minAmount, maxAmount: data.maxAmount, expireDate: data.expireDate, percentage: data.percentage }).then((response) => {
                        response.message = 'coupon Added successfuly'
                        response.status = false;

                        resolve(response)
                    })
            }


        })
    },

    // view coupons

    veiwCoupons: () => {
        return new Promise(async (resolve, reject) => {
            let coupon = await db.get().collection(collection.COUPON_COLLECTION).find().toArray()

            resolve(coupon)
        })

    },
    //coupon apply

    applycoupon: (data, userId, date, totalAmount) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let couponMathch = await db.get().collection(collection.COUPON_COLLECTION).findOne({ code: data.coupon })

            if (couponMathch) {
                // date =new Date().toJSON().slice(0,10)
                console.log(data);
                let user = await db.get().collection(collection.COUPON_COLLECTION).findOne({ code: data.coupon, Users: ObjectId(userId) })
                if (user) {
                    console.log('coupon used user');
                    response.used = 'Coupon Already Used'
                    resolve(response)
                } else {


                    console.log(date, 'dateeeeeeeee*****');
                    const ExpireDate = new Date(couponMathch.expireDate)

                    console.log(ExpireDate, 'expiredateeeeee');
                    response.couponData = couponMathch
                    // coupons use checking qurrry
                    // if(){

                    // }



                    if (date <= ExpireDate) {

                        console.log('not expire coupon');

                        response.dataValid = true
                        resolve(response)
                        let Total = totalAmount

                        if (Total >= couponMathch.minAmount) {
                            console.log('min amount ');
                            response.verifyminAmount = true

                            resolve(response)

                            if (Total <= couponMathch.maxAmount) {
                                console.log('Max amount8888');
                                response.verifymaxAmount = true
                                resolve(response)
                            } else {
                                response.maxAmountMsg = 'your maximum purchase should be ' + couponMathch.maxAmount
                                response.maxAmount = true
                                resolve(response)
                            }

                        } else {
                            response.minAmountMsg = 'This coupon is only applicable for above ' + couponMathch.minAmount
                            response.minAmount = true
                            resolve(response)

                        }





                    } else {

                       console.log('exipire couponedate');
                        response.Expiremassge = 'coupon is expired pleace try anothor coupon'
                        response.invalidDate =true
                        response.Couponused=false
                        resolve(response)
                        




                    }




                }

            } else {
                response.invalidCoupon =true
                response.invalidCouponMsg='invalid Coupon'

                resolve(response)

            }

            if(response.dataValid&&response.verifyminAmount&&response.verifymaxAmount){
                response.verify=true


                db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId)},{
                    $set:{
                        coupon:objectId(couponMathch._id)
                    }
                })
                resolve(response)
                console.log('last resolve');
            }


        })
    },


    couponVerify:(userId)=>{
        console.log('veryfiy  log************************');
        console.log(userId,'user id verfy');

        return new Promise(async(resolve,reject)=>{

            let userCart =await db.get().collection(collection.CART_COLLECTION).findOne({user:objectId(userId)})

            if(userCart.coupon){
                let coupenData =await db.get().collection(collection.COUPON_COLLECTION).findOne({_id:objectId(userCart.coupon)})


                resolve(coupenData)
                console.log(coupenData,'dataaaaaaaa88888888888888888888888');
            }else{
                resolve(userCart)
            }
            
            

        })

    }




}