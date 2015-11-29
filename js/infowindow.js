'use strict';

var foursquareclient='KJLO1IUFVJTJUEQK12AOLXRR2NVMS1WNXSXSRFYZ1KCYPOZ4';
var foursquaresecret='YF1OADST3HWMR5GHCDREPCJHUGAU3KUJCE3H4OG2VGJJ2HMU';
var foursquareurl = 'https://api.foursquare.com/v2/venues/search' +
  '?client_id=' + foursquareclient +
  '&client_secret=' + foursquaresecret +
  '&v=20130815' +
  '&limit=1' +
  '&near=' + cityName +
  '&query=';

var cityGridEndpoint = 'https://api.citygridmedia.com/content/places/v2/detail?publisher=test&format=json&client_ip=123.45.67.89&id_type=fsquare&id=' ;

// Called whenever a listview item or marker is clicked.
// @param: {marker} - this is the map marker object that needs to be animated
// @param: {name} -name of the location
// @param: {address} - address of the location
// These are already known from the google places request that put the markers on the map.
function activateMarker(marker, name, address) {

  //animate the marker for 1500 ms
  marker.setAnimation(google.maps.Animation.BOUNCE);
  setTimeout(function() {
    marker.setAnimation(null);
  }, 1500);

  //Get the foursquare data using jQuery getJSON method. Display the contact details if we get a response.
  var id;
  var infotext = '<div><strong>' + name + '</strong></div><div>' + address + '</div>';
  var jqxhr = $.getJSON(foursquareurl + name, function(data) {
    infotext += '<br><p><strong>Foursquare data:</strong><br>';
    id = data.response.venues[0].id;
    var contact = data.response.venues[0].contact;
    for (var prop in contact) {
      if (contact.hasOwnProperty(prop)) {
        infotext += '<strong>' + prop + ': </strong>' + contact[prop] + '<br>';
      }
    }
    infotext +='</p>';
    if (id)
    {
      var jqxhr2 = $.ajax({
        url:cityGridEndpoint+id,
        dataType: "jsonp",
        success: function(citygridData){
          if (citygridData.locations && citygridData.locations.length>0 )
          {
            console.log(citygridData.locations[0]);
            infotext +='<p><strong>Business Hours (from CityGrid): </strong><br>'+
              citygridData.locations[0].business_hours+'</p>';
            infoWindow.setContent(infotext);
          }
        },
        error: function(jxhr, status, error){
          console.log(status);
          console.log(error);
        }
      });
    }
  }).fail(function() {
    infotext += 'unable to get Foursquare data :(';
  }).always(function() {
    infoWindow.setContent(infotext);
    infoWindow.open(map, marker);
  });
}