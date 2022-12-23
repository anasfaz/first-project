var db = require('../config/connection')
var collection = require('../config/collections');
const { response } = require('../app');
var objectId = require('mongodb').ObjectId

module.exports = {

    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            console.log('get alllllllllllllllllllllllllllll userrrrrrrrrrr');
            let userData = await db.get().collection(collection.USER_COLLECTION).find().toArray()

            resolve(userData)
            console.log(userData)
        })
    },

    /// get block user 

    blockUser:(userId)=>{
        return new Promise((resolve,reject)=>{
            console.log('block userrrrrrrrrrrr')
            console.log(userId)
             db.get().collection(collection.USER_COLLECTION)
            .updateOne({_id:objectId(userId)},{$set:{block:true}}).then((response)=>{

                console.log(response);
                resolve(response)
            })

        })
    },

    ///unblock user 
    UnblockUser:(userId)=>{
        return new Promise((resolve,reject)=>{
            console.log(userId,'kkkkk');

             db.get().collection(collection.USER_COLLECTION)
            .updateOne({_id:objectId(userId)},{$set:{block:false}}).then((response)=>{
                console.log(response,'llllll');
                resolve(response)
            })
            
        })
    }




}
