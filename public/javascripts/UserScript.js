


$("#checkout-form").submit((e) => {
  e.preventDefault()
  $.ajax({
      url: '/place-order',
      method: 'post',
      data: $('#checkout-form').serialize(),
      success: (response) => {
          if (response.CodSuccess) {
              location.href = '/order-success'
          } else if (response.payPal) {

              location.replace(response.linkto)

          }
          else {
              razorpayPayment(response)
          }
      }
  })
})

function razorpayPayment(order) {
  var options = {
      "key": "rzp_test_pQmt3rrvi9ODa0", // Enter the Key ID generated from the Dashboard
      "amount": order.amount * 100, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
      "currency": "INR",
      "name": "Crossroads",
      "description": "Test Transaction",
      "image": "https://example.com/your_logo",
      "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
      "handler": function (response) {


          verifyPayment(response, order)
        
      },
      "modal": {
        "ondismiss": function(){
          
          window.location.replace('http://localhost:3000/pyment-failed/'+order.receipt);
        }
    },
      "prefill": {
          "name": "Gaurav Kumar",
          "email": "gaurav.kumar@example.com",
          "contact": "9999999999"
      },
      "notes": {
          "address": "Razorpay Corporate Office"
      },
      "theme": {
          "color": "#3399cc"
      }
  }
  var rzp1 = new Razorpay(options);
  rzp1.open();
}
function verifyPayment(payment, order) {
  $.ajax({
      url: '/verify-payment',
      data: {
          payment,
          order
      },
      method: 'post',
      success: (response) => {
          if (response.status) {
              location.href = '/order-success'

          } else {
              alert('Payment Failed')
          }
      }
  })
}





function applycoupon(event){
    event.preventDefault()
    console.log('***************coupn')
    let coupon =document.getElementById('couponName').value
    console.log(coupon,'***************coupn')
    $.ajax({
      url:'/apply-coupon',
      data:{
          coupon
      },
      method:'post',
      success:(response)=>{
          console.log(response,'ajax')
          if(response.verify){
            // response.used=false
            // response.maxAmount=false
            // response.invalidDate=false
            // response.invalidCoupon=false
            // response.minAmount=false


            document.getElementById('discountPrice').innerHTML='₹'+response.discountAmount
            document.getElementById('totalAll').innerHTML='₹'+response.price
            document.getElementById('percentage').innerHTML=response.couponData.percentage+'%'
            document.getElementById('error').innerHTML = ""
            // document.getElementById('error2').innerHTML = '(Coupon has Applied)'
           // document.getElementById('').innerHTML='₹'+response.discountAmount
          }else{
            document.getElementById('discountPrice').innerHTML='₹'+0
            document.getElementById('totalAll').innerHTML='₹'+response.Total
            document.getElementById('percentage').innerHTML=0+'%'
            

             if(response.used){
              document.getElementById('error').innerHTML=response.used
             }else if(response.minAmount){
              document.getElementById('error').innerHTML=response.minAmountMsg


             }else if(response.maxAmount){
              document.getElementById('error').innerHTML= response.maxAmountMsg

             }else if( response.invalidDate){
              document.getElementById('error').innerHTML=response.Expiremassge

             }else if(response.invalidCoupon){
              document.getElementById('error').innerHTML=response.invalidCouponMsg

             }else if(response.noCoupon){
              document.getElementById('error').innerHTML='Plece enter coupon code'

             }
          }
          
      }
    })
  }


  function addTocart(proId){
    $.ajax({
        url:'/add-Cart/'+proId,
        method:'get',
        success:(response)=>{
            if(response.status){
                let count=$('#cart-count').html()
                count=parseInt(count)+1
                $("#cart-count").html(count)
                swal("Add to Cart !", "You clicked the button!", "success");
            }
             
        }
    })
   
    
   } 
 

   function addTowishlist(proId){
    console.log('__________________________________****************');
    console.log(proId)
    $.ajax({
        url:'/add-wishlist/'+proId,
        method:'get',
        success:(response)=>{
            if(response.status){
                console.log('-----------------------log');
                swal("Add to wishlist !", "You clicked the button!", "success");
            }
            

        }
    })
}
// change quantity and  remove product ajax
function changeQuantity(cartId, productId, userId, count) {
    console.log(userId[0]._id, 'User IDDDDDDDDDDDDD')
    console.log(productId, 'ppppppppppppppppppppppp')
    console.log(count, 'counttttttttttttttttttttttttt')
    let quantity = parseInt(document.getElementById(productId).value)
    console.log(quantity)
    cont = parseInt(count)
    console.log(userId, '////////////////////////////////////////////////')


    if (count == -1 && quantity == 1) {
        console.log('********************')
        swal({
            title: "Are you sure?",
            text: " Product remove from cart!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                if (willDelete) {
                    
                    $.ajax({
                        url: '/change-product-quantity',
                        data: {
                            user: userId,
                            cart: cartId,
                            product: productId,
                            count: count,
                            quantity: quantity
                        },
                        method: 'post',
                        success: (response) => {

                            if (response.removeProduct) {
                                 swal("Your product  removed", {
                                icon: "success",
                            });
                            setTimeout(() => {
                                location.reload()
                            },"1000" );
                            } else {
                                console.log(response)

                                document.getElementById(productId).value = quantity + count
                                document.getElementById('total').innerHTML = response.total

                            }

                        }
                    })
                } else {
                    swal("Your product not removed");
                }
            });
    } else {
        $.ajax({
            url: '/change-product-quantity',
            data: {
                user: userId,
                cart: cartId,
                product: productId,
                count: count,
                quantity: quantity
            },
            method: 'post',
            success: (response) => {

                if (response.removeProduct) {
                    alert('prodect removed from cart ')
                    location.reload()
                } else {
                    console.log(response)

                    document.getElementById(productId).value = quantity + count
                    document.getElementById('total').innerHTML = response.total

                }

            }
        })
    }


}



//remove producut ajax
function removeProduct(cartId, productId, userId) {



    swal({
        title: "Remove Product!",
        text: "Press Ok to confirm!",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
        .then((willDelete) => {
            if (willDelete) {

                $.ajax({
                    url: '/remove-product',
                    data: {
                        user: userId,
                        cart: cartId,
                        product: productId,

                    },
                    method: 'post',
                    success: (response) => {

                        if (response.removeProductfromCart) {
                            swal("Your product  removed", {
                                icon: "success",
                                
                            });
                            setTimeout(() => {
                                location.reload()
                            },"1000" );
                        }

                    }
                })


            } else {
                swal("Your product not removed");
            }
        });





}

function removeWishlist(wishlistId,proId,userId){
    console.log(wishlistId,'wishlist');
    console.log(proId,'product');
    console.log(userId,'user');

    $.ajax({
        url:'/remove-wishlist',
        data:{
            wishlist:wishlistId,
            user:userId,
            product:proId
        },
        method:'post',
        success:(response)=>{
            if(response.removeProductWishlist){
                swal("Your product  removed", {
                    icon: "success",
                    
                });
                setTimeout(() => {
                    location.reload()
                },"1000" );
                 
            }
        }
    })
}