var db = require('../config/connection')
var collection = require('../config/collections');
const { response } = require('../app');

module.exports = {

    findPymentDeteiles: () => {
        return new Promise(async (resolve, reject) => {

            const cod = await db.get()?.collection(collection.ORDER_COLLECTION).find({ paymentMethod: 'COD' }).count()
            const payPal = await db.get()?.collection(collection.ORDER_COLLECTION).find({ paymentMethod: 'PayPal' }).count()
            const RazorPay = await db.get().collection(collection.ORDER_COLLECTION).find({ paymentMethod: 'Razorpay' }).count()
            const totalSales = await db.get().collection(collection.ORDER_COLLECTION).find().count()
            const totoalUsers = await db.get().collection(collection.USER_COLLECTION).find().count()
            const totalAmount = await db.get().collection(collection.ORDER_COLLECTION)
                .aggregate([
                    {
                        $group: {
                            _id: "",
                            "Total": { $sum: "$totalAmount" }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            "TotalAmount": '$Total'
                        }
                    }
                ]).toArray()







            const count = {}
            count.cod = cod
            count.payPal = payPal
            count.razorPay = RazorPay
            count.sales = totalSales
            count.UserTotal = totoalUsers
            count.TotalAmount = totalAmount[0].TotalAmount
            resolve(count)

            //   resolve(paytmentmethods)
            //   console.log(paytmentmethods,'------pa----------responseeeeeeeee-----------------------');


        })


    },

    monthgraph: () => {

        return new Promise(async (resolve, reject) => {
            let monthdate = await db.get().collection(collection.ORDER_COLLECTION)
                .aggregate([
                    {
                        $group:
                          {_id:{
                            'day': { $dayOfMonth: "$date" },
                            'month': { $month: "$date" },
                           'year': { $year: "$date" }},
                            totalAmount:{$sum:'$totalAmount'}
                        }

                      },
                    {

                        $project: {
                            _id:0,day:'$_id.day',month:'$_id.month',year:'$_id.year',totalAmount:1


                        }

                    },
                    {
                        $sort: { day: -1, }
                    },
                    {
                        $limit:31
                    }
                ]).toArray()
            monthdate.forEach(element => {
                function toMonthName(month) {
                    const date = new Date();
                    date.setMonth(month - 1);
                    return date.toLocaleString('en-US', {
                        month: 'long',
                    });
                }
                element.month = toMonthName(element.month)
            });

            resolve(monthdate)
            console.log(monthdate, '------------month------------');
        })


    },

    salesReport:(date)=>{
       return new Promise(async(resolve,reject)=>{
      let sales=await  db.get().collection(collection.ORDER_COLLECTION).aggregate([
        {
            $match:{orderDate:{$gte:date.fromdate,$lte:date.todate}}
        },{
            $project:{
              _id:0,
              totalAmount:1,
              products:1,
              orderDate:1
            }
           },
           {
            $unwind:'$products'
           },
           
           {
            $group:{
              _id:'$products.productName',
              totalAmount:{$sum:'$totalAmount'},
              Quantity:{$sum:'$products.quantity'}
            }
           },
    
      ]).toArray()
         console.log(sales,'saleeeeeeeeeeeeeeeeeeeeeeeeeeeee');
         resolve(sales)
       })
        



    }

}