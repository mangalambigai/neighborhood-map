"use strict";

/**
 * called after google maps script is loaded.
 * creates the map
 */
function initializeMap() {
  //give the city's hardcoded latitude, longitude so the map loads faster.
  var mapOptions = {
    center: {
      lat: lat,
      lng: lng
    },
    zoom: 14,
    scrollwheel: false,
    draggable: false
  };

  map = new google.maps.Map(document.querySelector('#mapDiv'), mapOptions);

  // Sets the boundaries of the map based on pin locations
  window.mapBounds = new google.maps.LatLngBounds();
}

/**
 * called by viewmodel for each new location
 * @param {string} name - this is the place's name
 * this calls the place api
 */
function createNewMarker(name) {
  // creates a Google place search service object.PlacesService does the work of
  // actually searching for location data.
  var service = new google.maps.places.PlacesService(map);
  // the search request object
  var request = {
    query: name + ' ' + cityName,
  };
  // Actually searches the Google Maps API for location data and runs the callback
  // function with the search results after each search.
  service.textSearch(request, function(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      createMapMarker(results[0]);
    }
  });
}

/**
 * Reads Google Places search results to create map pins.
 * @param {string} placeData - object returned from search results containing information
 * about a single location.
 */
function createMapMarker(placeData) {
  // The next lines save location data from the search result object to local variables
  var lat = placeData.geometry.location.lat(); // latitude from the place service
  var lon = placeData.geometry.location.lng(); // longitude from the place service
  var address = placeData.formatted_address; // address of the place from the place service
  var name = placeData.name; // name of the place from the place service
  var bounds = window.mapBounds; // current boundaries of the map window

  // marker is an object with additional data about the pin for a single location
  var marker = new google.maps.Marker({
    map: map,
    position: placeData.geometry.location,
    title: name
  });

  viewModel.addMarker(marker, name, address);

  google.maps.event.addListener(marker, 'click', function() {
    activateMarker(marker, name, address);
  });

  // this is where the pin actually gets added to the map.
  // bounds.extend() takes in a map location object
  bounds.extend(new google.maps.LatLng(lat, lon));
  // fit the map to the new marker
  map.fitBounds(bounds);
  // center the map
  map.setCenter(bounds.getCenter());
}