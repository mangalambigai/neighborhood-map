/*jshint globalstrict: true*/
'use strict';

/**
 * called after google maps script is loaded.
 * creates the map
 */
function initializeMap() {
  //give the city's hardcoded latitude, longitude so the map loads faster.
  var mapOptions = {
    center: {
      lat: LATITUDE,
      lng: LONGITUDE
    },
    zoom: 14,
    scrollwheel: false,
    draggable: false
  };

  map = new google.maps.Map(document.querySelector('#mapDiv'), mapOptions);

  // Sets the boundaries of the map based on pin locations
  window.mapBounds = new google.maps.LatLngBounds();
}

function createMarker(name, address, lat, lng, type)
{
  var bounds = window.mapBounds; // current boundaries of the map window

  var icon;
  switch(type){
    case 'food':
      icon = 'icons/restaurant.png';
      break;
    case 'atm':
      icon = 'icons/atm-2.png';
      break;
    case 'lodging':
      icon = 'icons/lodging-2.png';
      break;
  }

  // marker is an object with additional data about the pin for a single location
  var marker = new google.maps.Marker({
    map: map,
    position: new google.maps.LatLng(lat,lng),
    title: name,
    icon: icon
  });

  google.maps.event.addListener(marker, 'click', function() {
    activateMarker(marker, name, address);
  });

  // this is where the pin actually gets added to the map.
  // bounds.extend() takes in a map location object
  bounds.extend(new google.maps.LatLng(lat, lng));
  // fit the map to the new marker
  map.fitBounds(bounds);
  // center the map
  map.setCenter(bounds.getCenter());

  return marker;
}
