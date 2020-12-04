var express = require('express');
var router = express.Router();
var rest = require('restler');
var fs = require('fs');
var pdf = require('html-pdf');
var request = require('request');
// var jsPDF = require('jspdf');
var cheerio = require('cheerio')
var htmlToImage = require('html-to-image');
var webshot = require('webshot');
var nl2br  = require('nl2br');
var moment = require('moment');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

router.get('/', function(req, res, next) {
    var options = {
        screenSize: {
          'width': 1350,
          'height': 2200
        }
      }
      var options2 = {
            'width': 1350,
            'height': 2200
        }

  webshot("https://api-wildthings.devotestudio.com.com/order/pdf/5c14273221a30375248c4293", "./public/pdf/test.png", options, function(err) {


    // var html_parsed = '<img src="./public/pdf/test.png"/>'
    // pdf.create(html_parsed, options2).toFile('./public/pdf/order.pdf', function(err, res) {
    //   if (err) return console.log(err);
    //   console.log(res); // { filename: '/app/businesscard.pdf' }
    // });
  });

});

router.post('/new/order', function(req, res, next) {
  console.log(Object.keys(req.body))
  console.log(req.body.line_items)
  var db = req.db;
  var ordersDB = db.get('orders')
  ordersDB.insert(req.body)
  var items = req.body.line_items;
  for (i=0; i<items.length; i++) {
    console.log(items[i].title)
    rest.get(shopifyURIapi + '/admin/products/' + items[i].product_id + '.json').on('complete', function(result) {
          if (result instanceof Error) {
            console.log('Error:', result.message);
            this.retry(5000); // try again after 5 sec
          } else {
            if (result.product.product_type === "Flowers") {
              console.log("DELIVERY")

              // var html = fs.readFileSync('./test/businesscard.html', 'utf8');
            }
          }
        })
    if (i === items.length -1) {
      res.send()
    }
  }
});

router.get('/order/pdf/:id', function(req, res, next) {
  var id = req.params.id;
  var db = req.db;
  var ordersDB = db.get('orders')
  var staffDB = db.get('staff')
  ordersDB.findOne({"_id": id},{},function(err, order){
    console.log(order)
    console.log(order.note_attributes.length);
    order.note = nl2br(order.note);
    console.log(order.note);
    order.deliver_day = "";
    if (order.user_id) {

    } else {
      order.user_id = "";
    }
    order.orderNotes = {};

    for (i=0; i<order.note_attributes.length; i++) {
        var key = order.note_attributes[i].name.replace(/ /g, "_").replace(/-/g, "_").toLowerCase();
        var value = order.note_attributes[i].value.toString();
        order.orderNotes[key] = value;
        if (i=== order.note_attributes.length-1) {
          console.log(order.orderNotes)

        }
    }

    staffDB.findOne({"user_id": order.user_id.toString()}, {}, function(err, staff) {
      console.log(order.orderNotes)
         if (staff === null) {
           if (order.source_name === 'web') {
             if (order.orderNotes.checkout_method === "delivery") {
               order.note = nl2br(order.note);
               order.processed_at = moment(order.processed_at).format('M/D/YY')
               order.orderNotes.delivery_date = moment(order.orderNotes.delivery_date).format('M/D/YY')
               order.delivery_day = moment(order.orderNotes.delivery_date).format('dddd')
               order.staff = 'online';
               res.render('web-delivery', {"order": order })

             } else if (order.orderNotes.checkout_method === "pickup") {
               order.note = nl2br(order.note);
               order.created_at = moment(order.created_at).format('M/D/YY')
               order.orderNotes.pickup_date = moment(order.orderNotes.pickup_date).format('M/D/YY')
               order.pickup_day = moment(order.orderNotes.pickup_date, 'YYYY/MM/DD').format('dddd')
               order.staff = 'online';
               res.render('web-pickup', {"order": order })
             } else {
             }

           } else if (order.source_name === 'pos') {

             if (order.orderNotes.checkout_method === "delivery") {
               order.orderNotes.date = moment(order.orderNotes.date).format('M/D/YY')
               order.orderNotes.card_note = nl2br(order.orderNotes.card_note);
               order.delivery_day = moment(order.orderNotes.date).format('dddd')
               order.closed_at = moment(order.closed_at).format('M/D/YY')
               order.staff = "Unknown";
               res.render('pos-delivery', {"order": order })

             } else if (order.orderNotes.checkout_method === "pickup") {
               order.orderNotes.date = moment(order.orderNotes.date).format('M/D/YY')
               order.closed_at = moment(order.closed_at).format('M/D/YY')
               order.pickup_date = moment(order.orderNotes.pickup_date).format('M/D/YY')
               order.pickup_day = moment(order.orderNotes.pickup_date).format('dddd')
               order.staff = 'unknown';
               res.render('pos-pickup', {"order": order })

             } else {

             }
           } else {
           }

         } else {

           if (order.source_name === 'web') {
             if (order.orderNotes.checkout_method === "delivery") {
               order.note = nl2br(order.note);
               order.processed_at = moment(order.processed_at).format('M/D/YY')
               order.orderNotes.delivery_date = moment(order.orderNotes.delivery_date).format('M/D/YY')
               order.delivery_day = moment(order.orderNotes.delivery_date).format('dddd')
               order.staff = 'online';
               res.render('web-delivery', {"order": order })

             } else if (order.orderNotes.checkout_method === "pickup") {
               order.note = nl2br(order.note);
               order.created_at = moment(order.created_at).format('M/D/YY')
               order.orderNotes.pickup_date = moment(order.orderNotes.pickup_date).format('M/D/YY')
               order.pickup_day = moment(order.orderNotes.pickup_date, 'YYYY/MM/DD').format('dddd')
               order.staff = 'online';
               res.render('web-pickup', {"order": order })
             } else {
             }

           } else if (order.source_name === 'pos') {

             if (order.orderNotes.checkout_method === "delivery") {
               order.orderNotes.date = moment(order.orderNotes.date).format('M/D/YY')
               order.orderNotes.card_note = nl2br(order.orderNotes.card_note);
               order.delivery_day = moment(order.orderNotes.date).format('dddd')
               order.closed_at = moment(order.closed_at).format('M/D/YY')
               order.staff = staff.name;
               res.render('pos-delivery', {"order": order })

             } else if (order.orderNotes.checkout_method === "pickup") {
               order.orderNotes.date = moment(order.orderNotes.date).format('M/D/YY')
               order.closed_at = moment(order.closed_at).format('M/D/YY')
               order.pickup_date = moment(order.orderNotes.pickup_date).format('dddd')
               order.staff = staff.name;
               res.render('pos-pickup', {"order": order })

             } else {

             }
           } else {
           }
        }
      })
  } )
})

router.post('/order/pdf/save/:id', multipartMiddleware, function(req, res, next) {

  var id = req.params.id;
  var filename  = './'+ id +'.pdf';
  console.log(id);
  var db = req.db;
  var file = req.body
  console.log(file)
  // var pdf = new jsPDF('p', 'mm', 'a4');
  // pdf.addImage(file.image, 'PNG', 0, 0, 211, 298);
  // console.log(pdf)
  // var data = pdf.output();
  //
  // fs.writeFileSync(filename, data);
})

module.exports = router;
