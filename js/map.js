"use strict";
//https://developers.google.com/maps/documentation/javascript/reference

/*
Start here! initializeMap() is called when page is loaded.
*/
  function initializeMap() {

//give the city's hardcoded latitude, longitude so the map loads faster.
  var mapOptions = {
//    disableDefaultUI: true
    center: {lat: lat, lng: lng},
    zoom: 14,
    scrollwheel: false,
    draggable: false
  };

  map = new google.maps.Map(document.querySelector('#mapDiv'), mapOptions);

/*
  var input = (document.getElementById('textMorePlaces'));
  // Create the autocomplete helper, and associate it with
  // an HTML text input box.
  var options = {
    types: ['establishment', 'geocode']
  };
  var autocomplete = new google.maps.places.Autocomplete(input, options);
  autocomplete.bindTo('bounds', map);

  //map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  var infowindowMore = new google.maps.InfoWindow();
  var marker = new google.maps.Marker({
    map: map
  });
  google.maps.event.addListener(marker, 'click', function() {
    infowindowMore.open(map, marker);
  });

  // Get the full place details when the user selects a place from the
  // list of suggestions.
  google.maps.event.addListener(autocomplete, 'place_changed', function() {
    infowindowMore.close();
    var place = autocomplete.getPlace();
    if (!place.geometry) {
      return;
    }

    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      //map.setZoom(17);
    }

    // Set the position of the marker using the place ID and location.
    marker.setPlace( ({
      placeId: place.place_id,
      location: place.geometry.location
    }));
    marker.setVisible(true);

    infowindowMore.setContent('<div><strong>' + place.name + '</strong><br>' +
        'Place ID: ' + place.place_id + '<br>' +
        place.formatted_address + '</div>');
    infowindowMore.open(map, marker);
  });
*/



  /*
  callback(results, status) makes sure the search returned results for a location.
  If so, it creates a new map marker for that location.
  */
  function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      createMapMarker(results[0]);
    }
  }


  /*
  pinPoster() fires off Google place searches for each location
  */
  function pinPoster() {

    // creates a Google place search service object. PlacesService does the work of
    // actually searching for location data.
    var service = new google.maps.places.PlacesService(map);

    // Iterates through the array of locations, creates a search object for each location
    for (var place in allLocations) {
      // the search request object
      var request = {
        query: allLocations[place]+' '+ cityName,
      };

      // Actually searches the Google Maps API for location data and runs the callback
      // function with the search results after each search.
      service.textSearch(request, callback);
    }
  }

  // Sets the boundaries of the map based on pin locations
  window.mapBounds = new google.maps.LatLngBounds();

  // pinPoster(locations) creates pins on the map for each location in
  // the locations array
  //pinPoster();

}

  function createNewMarker(name) {
    // creates a Google place search service object. PlacesService does the work of
    // actually searching for location data.
    var service = new google.maps.places.PlacesService(map);
    // the search request object
    var request = {
      query: name+' '+ cityName,
    };
    // Actually searches the Google Maps API for location data and runs the callback
    // function with the search results after each search.
    service.textSearch(request, function (results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            createMapMarker(results[0]);
      }
    });
  }

  /*
  createMapMarker(placeData) reads Google Places search results to create map pins.
  placeData is the object returned from search results containing information
  about a single location.
  */
  function createMapMarker(placeData) {
    // The next lines save location data from the search result object to local variables
    var lat = placeData.geometry.location.lat();  // latitude from the place service
    var lon = placeData.geometry.location.lng();  // longitude from the place service
    var address = placeData.formatted_address;   // address of the place from the place service
    var name = placeData.name;   // name of the place from the place service
    var bounds = window.mapBounds;            // current boundaries of the map window

    // marker is an object with additional data about the pin for a single location
    var marker = new google.maps.Marker({
      map: map,
      position: placeData.geometry.location,
      title: name
    });

    viewModel.addMarker(marker, name, address);

    google.maps.event.addListener(marker, 'click', function () {
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
