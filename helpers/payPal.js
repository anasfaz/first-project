const paypal = require('paypal-rest-sdk');

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AST80mU1Y2sgxH5_3NvtRp4Xl5j6plIw_4h9wakHeZyuUzLOA1CYSKrRuI5D6Wy726A3hAJHiysSEtIh',
    'client_secret': 'EDgyo7A-d2PAQ46jyfmt9-YWbHE4AEnthQ1uuY7fIgFENTWLnlwGXta1C1vNi1esc0bOPJl69cWCfRIr'
  });


module.exports={

//-------------------------PayPal-----------------------------------------//

createPaypal:(payment)=>{
  console.log(payment,'-----------------------------------------------');
    return new Promise((resolve,reject)=>{
     paypal.payment.create(payment, function (error, payment) {
       if (error) {
           reject(error)
       } else {
           console.log("Create Payment Response");
           console.log(payment);
           resolve(payment);
       }
       });
    })
   },





}