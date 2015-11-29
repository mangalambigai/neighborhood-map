"use strict";

var foursquareurl = 'https://api.foursquare.com/v2/venues/search' +
  '?client_id=' + foursquareclient +
  '&client_secret=' + foursquaresecret +
  '&v=20130815' +
  '&limit=1' +
  '&near=' + cityName +
  '&query=';

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
  var infotext = '<div><strong>' + name + '</strong></div><div>' + address + '</div>';
  var jqxhr = $.getJSON(foursquareurl + name, function(data) {
    infotext += '<h6>Foursquare data:</h6>';
    var contact = data.response.venues[0].contact;
    for (var prop in contact) {
      if (contact.hasOwnProperty(prop)) {
        infotext += '<p><strong>' + prop + ': </strong>' + contact[prop] + '</p>';
      }
    }
  }).fail(function() {
    infotext += 'unable to get Foursquare data :(';
  }).always(function() {
    infoWindow.setContent(infotext);
    infoWindow.open(map, marker);
  });
}