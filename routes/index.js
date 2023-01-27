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
var bold_api_key = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImU1MjM1MWU1ZTc4YTUwZDdhZGM4NGViODQ5M2M3OTMxZDk0MjA0MzZiNDIyM2VmOTMwMjM4NTg4NzNhN2Q3YzYxZDVjY2NlMzhhNjk3YzIyIn0.eyJhdWQiOiIxMzQiLCJqdGkiOiJlNTIzNTFlNWU3OGE1MGQ3YWRjODRlYjg0OTNjNzkzMWQ5NDIwNDM2YjQyMjNlZjkzMDIzODU4ODczYTdkN2M2MWQ1Y2NjZTM4YTY5N2MyMiIsImlhdCI6MTYwOTc4Njg1MSwibmJmIjoxNjA5Nzg2ODUxLCJleHAiOjMxODc2MjM2NTEsInN1YiI6IjI0MTMiLCJzY29wZXMiOlsicmVhZF9jdXN0b21lciIsIndyaXRlX2N1c3RvbWVyIiwicmVhZF9zdWJzY3JpcHRpb24iLCJ3cml0ZV9zdWJzY3JpcHRpb24iLCJyZWFkX3N1YnNjcmlwdGlvbl9ncm91cCIsIndyaXRlX3N1YnNjcmlwdGlvbl9ncm91cCIsInJlYWRfc2hvcCIsInJlYWRfc2hvcF9zZXR0aW5nIiwid3JpdGVfc2hvcF9zZXR0aW5nIiwicmVhZF9hY3Rpdml0eV9sb2ciLCJ3cml0ZV9hY3Rpdml0eV9sb2ciXX0.hWYDygltEjthwfmLeX2ZewiGBYEDNI20LHbDihw1PBxnv5gIaxm1_TPwgRxbSvKL4Nl8AJQaXIBqaFw5UXYoysJpODd3cgtsfoXLlcRxF5T5joHufhhNrBz7bvlMxBGjLGgEj0_T6NadoXklpOhmvMIlaZKPbYnd_z34RQgzPutNp5iYMoQTBOTTeqGNL8na5EBKm2NRRsMV1SzzYn6nx5md0tawD7tofPxKoSftBM2ZgeqYzIC34obo1NoDKa8orcHs7-zp5N6K8O1NahOYmCdVTsnLdtO9yRpf_uh7ICvD1BaPSS2LAyq5v7kDqOeWa-pF_aIbj1E6j98MvQSmtfDC_gQHvG7gTTgxem1R6pXnnUiDJ0Q_rYnNWzLOUy9Z8uYinPeKs8PX7vj3I84uQ-zeFsdIGIK3BFAgdDEGzeUDGDBMm5Mc2KPQypKyKwxbP-DzkPGwBZMmKGArtIxqJoBvsZD6iIVTyPk6T44S6oG9Be1Zr4tE_eRlXaSBi2kHKdUZHKGyhj6OfEStLizQEa5UiHMRQ2bzvkXEXm2tfHy7XTcV4_HoqiXBQG9xPMqI2nl7M0mFjPQqqrAsEPSTJf3vRQYnbtERb45DgNg3vTnNAW4h1vAtGX9RHKnKrA38Sn-vdL3gDgdzCwFHioEsMgxzk9X_uGvRWlOSh62dI-U';

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

  webshot("https://api.wildthings-pos.com/order/pdf/5c14273221a30375248c4293", "./public/pdf/test.png", options, function(err) {


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
      console.log(order.source_name)
         if (staff === null) {
           if (order.source_name === 'web') {
             if (order.orderNotes.checkout_method === "delivery") {
               order.note = nl2br(order.note);
               order.created_at = moment(order.created_at).format('M/D/YY')
               order.processed_at = moment(order.processed_at).format('M/D/YY')
               order.orderNotes.delivery_date = moment(order.orderNotes.delivery_date).format('M/D/YY')
               order.delivery_day = moment(order.orderNotes.delivery_date).format('dddd')
               order.staff = 'online';
               res.render('web-delivery', {"order": order })

             } else if (order.orderNotes.checkout_method === "pickup") {
               order.note = nl2br(order.note);
               order.created_at = moment(order.created_at).format('M/D/YY')
               order.orderNotes.pickup_date = moment(order.orderNotes.pickup_date).format('M/D/YY')
               order.pickup_day = moment(order.orderNotes.pickup_date, 'M/D/YY').format('dddd')
               order.staff = 'online';
               res.render('web-pickup', {"order": order })
             } else {
             }

           } else if (order.source_name === 'pos' || order.source_name === 'shopify_draft_order') {

             if (order.orderNotes.checkout_method === "delivery") {
               order.created_at = moment(order.created_at).format('M/D/YY')
               order.orderNotes.date = moment(order.orderNotes.date).format('M/D/YY')
               order.orderNotes.card_note = nl2br(order.orderNotes.card_note);
               order.delivery_day = moment(order.orderNotes.delivery_date).format('dddd')
               order.closed_at = moment(order.closed_at).format('M/D/YY')
               order.staff = "Unknown";
               // console.log(order.orderNotes.card_note)
               res.render('pos-delivery', {"order": order })

             } else if (order.orderNotes.checkout_method === "pickup") {
               order.created_at = moment(order.created_at).format('M/D/YY')
               order.orderNotes.date = moment(order.orderNotes.date).format('M/D/YY')
               order.closed_at = moment(order.closed_at).format('M/D/YY')
               order.pickup_date = moment(order.orderNotes.pickup_date).format('M/D/YY')
               order.pickup_day = moment(order.orderNotes.pickup_date).format('dddd')
               order.staff = 'unknown';
               res.render('pos-pickup', {"order": order })

             } else {
               order.created_at = moment(order.created_at).format('M/D/YY')
               order.orderNotes.date = moment(order.orderNotes.date).format('M/D/YY')
               order.closed_at = moment(order.closed_at).format('M/D/YY')
               order.pickup_date = moment(order.orderNotes.pickup_date).format('M/D/YY')
               order.pickup_day = moment(order.orderNotes.pickup_date).format('dddd')
               order.staff = 'unknown';
               res.render('pos-pickup', {"order": order })
             }
           } else {
             if (order.orderNotes.checkout_method === "delivery") {
               order.created_at = moment(order.created_at).format('M/D/YY')
               order.orderNotes.date = moment(order.orderNotes.date).format('M/D/YY')
               order.orderNotes.card_note = nl2br(order.orderNotes.card_note);
               order.delivery_day = moment(order.orderNotes.delivery_date).format('dddd')
               order.closed_at = moment(order.closed_at).format('M/D/YY')
               order.staff = "Unknown";
               // console.log(order.orderNotes.card_note)
               res.render('pos-delivery', {"order": order })

             } else if (order.orderNotes.checkout_method === "pickup") {
               order.created_at = moment(order.created_at).format('M/D/YY')
               order.orderNotes.date = moment(order.orderNotes.date).format('M/D/YY')
               order.closed_at = moment(order.closed_at).format('M/D/YY')
               order.pickup_date = moment(order.orderNotes.pickup_date).format('M/D/YY')
               order.pickup_day = moment(order.orderNotes.pickup_date).format('dddd')
               order.staff = 'unknown';
               res.render('pos-pickup', {"order": order })

             } else {
               order.created_at = moment(order.created_at).format('M/D/YY')
               order.orderNotes.date = moment(order.orderNotes.date).format('M/D/YY')
               order.closed_at = moment(order.closed_at).format('M/D/YY')
               order.pickup_date = moment(order.orderNotes.pickup_date).format('M/D/YY')
               order.pickup_day = moment(order.orderNotes.pickup_date).format('dddd')
               order.staff = 'unknown';
               res.render('pos-pickup', {"order": order })
             }
           }

         } else {

           if (order.source_name === 'web') {
             if (order.orderNotes.checkout_method === "delivery") {
               order.note = nl2br(order.note);
               order.created_at = moment(order.created_at).format('M/D/YY')
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
               order.created_at = moment(order.created_at).format('M/D/YY')
               order.orderNotes.date = moment(order.orderNotes.date).format('M/D/YY')
               order.orderNotes.card_note = nl2br(order.orderNotes.card_note);
               order.delivery_day = moment(order.orderNotes.delivery_date).format('dddd')
               order.closed_at = moment(order.closed_at).format('M/D/YY')
               order.staff = staff.name;
               res.render('pos-delivery', {"order": order })

             } else if (order.orderNotes.checkout_method === "pickup") {
               order.created_at = moment(order.created_at).format('M/D/YY')
               order.orderNotes.date = moment(order.orderNotes.date).format('M/D/YY')
               order.closed_at = moment(order.closed_at).format('M/D/YY')
               order.pickup_date = moment(order.orderNotes.pickup_date).format('dddd')
               order.staff = staff.name;
               res.render('pos-pickup', {"order": order })

             } else {
               order.created_at = moment(order.created_at).format('M/D/YY')
               order.orderNotes.date = moment(order.orderNotes.date).format('M/D/YY')
               order.closed_at = moment(order.closed_at).format('M/D/YY')
               order.pickup_date = moment(order.orderNotes.pickup_date).format('M/D/YY')
               order.pickup_day = moment(order.orderNotes.pickup_date).format('dddd')
               order.staff = 'unknown';
               res.render('pos-pickup', {"order": order })
             }
           } else {
             if (order.orderNotes.checkout_method === "delivery") {
               order.created_at = moment(order.created_at).format('M/D/YY')
               order.orderNotes.date = moment(order.orderNotes.date).format('M/D/YY')
               order.orderNotes.card_note = nl2br(order.orderNotes.card_note);
               order.delivery_day = moment(order.orderNotes.delivery_date).format('dddd')
               order.closed_at = moment(order.closed_at).format('M/D/YY')
               order.staff = staff.name;
               res.render('pos-delivery', {"order": order })

             } else if (order.orderNotes.checkout_method === "pickup") {
               order.created_at = moment(order.created_at).format('M/D/YY')
               order.orderNotes.date = moment(order.orderNotes.date).format('M/D/YY')
               order.closed_at = moment(order.closed_at).format('M/D/YY')
               order.pickup_date = moment(order.orderNotes.pickup_date).format('dddd')
               order.staff = staff.name;
               res.render('pos-pickup', {"order": order })

             } else {
               order.created_at = moment(order.created_at).format('M/D/YY')
               order.orderNotes.date = moment(order.orderNotes.date).format('M/D/YY')
               order.closed_at = moment(order.closed_at).format('M/D/YY')
               order.pickup_date = moment(order.orderNotes.pickup_date).format('M/D/YY')
               order.pickup_day = moment(order.orderNotes.pickup_date).format('dddd')
               order.staff = 'unknown';
               res.render('pos-pickup', {"order": order })
             }
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
