var db=require('../config/connection')
var collection=require('../config/collections');
const { response } = require('../app');
var objectId=require('mongodb').ObjectId
module.exports={
    //post add products
    addProduct:(product,callback)=>{

        console.log(product);
        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data)=>{
             console.log(data);
            callback(data.insertedId)

        })
    },
    getAllproducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })

    },
    DeleteProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
            console.log(proId);
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectId(proId)}).then((response)=>{
                
                console.log(response);

                resolve(response)
            })
        })
    },

    getProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=> {
                resolve(product)
            })
        })

    },

    updateProduct:(proId,productDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION)
            .updateOne({_id:objectId(proId)},{
                $set:{

                 Name:productDetails.Name,
                 Discription:productDetails.Discription,
                 Price:productDetails.Price,
                 Category:productDetails.Category
                 
                

                }
            }).then((response)=>{
                console.log(response);
                resolve()
            })
        })
    },

    //add category
    addCategory:(category)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).insertOne(category).then((data)=>{

                console.log(data);
                resolve(data.insertedId);

            })

        })
    },

    // get all category
    getAllCategory:()=>{
        return new Promise(async(resolve,reject)=>{
            let category=await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            resolve(category)
            console.log(category);
        })
    },

    // banner image 

    banner:(data)=>{
        return new Promise((resolve,reject)=>{
          db.get().collection(collection.BANNER_COLLECTION).insertOne(data).then((response)=>{
            resolve(response.insertedId)

          })
          
        })
    },

    // banner g

    
    getbanner:()=>{
        return new Promise(async(resolve,reject)=>{
        let banner=await  db.get().collection(collection.BANNER_COLLECTION).find().toArray()
        resolve(banner)
        })
    },

    //find banners

    bannersfind:()=>{
        return new Promise((resolve,reject)=>{
            let bannersviwes = db.get().collection(collection.BANNER_COLLECTION).find().toArray()
            resolve(bannersviwes)
        })
    }

    

   

    






}