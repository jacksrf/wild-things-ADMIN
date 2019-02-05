var express = require('express');
var router = express.Router();
var rest = require('restler');
var fs = require('fs');
var pdf = require('html-pdf');
var request = require('request');
var shop = 'als-flowers.myshopify.com';
var apiKey = '4081512935093e026334dc4561b90ef6';
var apiSecret = '7a060446ac0dda5075ea628e2595ee39';
var redirectUri = 'http://localhost:8090/generate_token';
var shopifyURIapi = 'https://' + apiKey + ':' + apiSecret + '@'+ shop;
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

  webshot("https://api.alsflowersmontgomery.com/order/pdf/5c14273221a30375248c4293", "./public/pdf/test.png", options, function(err) {


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
    console.log(order.note_attributes.length);
    order.note = nl2br(order.note);
    console.log(order.note);
    order.deliver_day = "";
    if (order.user_id) {

    } else {
      order.user_id = "";
    }
    staffDB.findOne({"user_id": order.user_id.toString()}, {}, function(err, staff) {

         if (staff === null) {
           console.log(staff)
           if (order.note_attributes.length === 6) {
             order.note = nl2br(order.note);
             order.processed_at = moment(order.processed_at).format('M/D/YY')
              order.note_attributes[3].value = moment(order.note_attributes[3].value).format('M/D/YY')
              order.delivery_day = moment(order.note_attributes[3].value).format('dddd')

             res.render('web', {"order": order })
           } else if (order.note_attributes.length === 5) {
             order.note = nl2br(order.note);
             order.processed_at = moment(order.processed_at).format('M/D/YY')
             order.note_attributes[2].value = moment(order.note_attributes[2].value).format('M/D/YY')
             order.delivery_day = moment(order.note_attributes[2].value).format('dddd')
             res.render('web2', {"order": order })
           } else if (order.note_attributes.length === 7) {
             order.note_attributes[6].value = nl2br(order.note_attributes[6].value);
             order.note_attributes[3].value = moment(order.note_attributes[3].value).format('M/D/YY')
             order.closed_at = moment(order.closed_at).format('M/D/YY')
             order.delivery_day = moment(order.note_attributes[3].value).format('dddd')
             order.staff = "Unknown";
             res.render('instore-new', {"order": order })
           } else if (order.note_attributes.length === 12) {
             order.note_attributes[9].value = moment(order.note_attributes[9].value).format('M/D/YY')
             order.note_attributes[7].value = nl2br(order.note_attributes[7].value);
             order.delivery_day = moment(order.note_attributes[9].value).format('dddd')
             order.closed_at = moment(order.closed_at).format('M/D/YY')
             order.staff = "Unknown";
             console.log(order.note_attributes[9].value)
             res.render('delivery-new', {"order": order })
           } else {
             res.render('old', {"order": order })
           }
         } else {
          console.log(staff)
          if (order.note_attributes.length === 6) {
            order.note = nl2br(order.note);
            order.processed_at = moment(order.processed_at).format('M/D/YY')
             order.note_attributes[3].value = moment(order.note_attributes[3].value).format('M/D/YY')
             order.delivery_day = moment(order.note_attributes[3].value).format('dddd')
            res.render('web', {"order": order })
          } else if (order.note_attributes.length === 5) {
            order.note = nl2br(order.note);
            order.processed_at = moment(order.processed_at).format('M/D/YY');
             order.note_attributes[2].value = moment(order.note_attributes[2].value).format('M/D/YY')
             order.delivery_day = moment(order.note_attributes[2].value).format('dddd')
            res.render('web2', {"order": order });
          } else if (order.note_attributes.length === 7) {
            order.note_attributes[6].value = nl2br(order.note_attributes[6].value);
            order.note_attributes[3].value = moment(order.note_attributes[3].value).format('M/D/YY')
            order.closed_at = moment(order.closed_at).format('M/D/YY')
            order.delivery_day = moment(order.note_attributes[3].value).format('dddd')
            order.staff = staff.name;
            res.render('instore-new', {"order": order })
          } else if (order.note_attributes.length === 12) {
            order.note_attributes[9].value = moment(order.note_attributes[9].value).format('M/D/YY')
            order.note_attributes[7].value = nl2br(order.note_attributes[7].value);
            order.closed_at = moment(order.closed_at).format('M/D/YY')
            order.delivery_day = moment(order.note_attributes[9].value).format('dddd')
            console.log(moment(order.note_attributes[9].value).format('dddd'))
            order.staff = staff.name;
            console.log(order.note_attributes[9].value)
            res.render('delivery-new', {"order": order })
          } else {
            res.render('old', {"order": order })
          }
        }
          // var html = fs.readFileSync('./test/businesscard.html', 'utf8');
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
