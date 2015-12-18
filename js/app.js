/*jshint globalstrict: true*/
'use strict';
//Hard code city, latitude- longitude for now.
//This should be customizable later
var CITYNAME = 'Mansfield, MA';
var LATITUDE = 42.022082;
var LONGITUDE = -71.223725;

var initialLocations = [
  'Quan\'s Kitchen',
  'Honey Dew Donuts',
  'Classic Pizza',
  'Dunkin\' Donuts',
  'Domino\'s Pizza',
  'Chipotle Mexican Grill',
  'Bertucci\'s',
  'Magic Pizza',
  'Papa Gino\'s'
];


var map;
var infoWindow;

/**
 * Represents a location object.
 * @constructor
 * @param {string} name - name of the location
 */
var Location = function(name) {
  this.name = ko.observable(name);
  this.visibility = ko.observable(true);
  //address and the mapmarker will be added to this later, when we get the info back from maps places api.
};

/**
 * This is the viewmodel.
 * @constructor
 */
var ViewModel = function() {
  var self = this;
  self.searchText = ko.observable('');

  //This is our list of list of location objects.
  self.locationList = ko.observableArray();

  /**
   * Ko calls subscribe everytime locationList changes
   * @param {changes} - List of changes, each change has a status added/ deleted
   * We will plot the marker for each added place,
   * and remove the marker for each removed place
   */
  self.locationList.subscribe(function(changes) {
    changes.forEach(function(change) {
      if (change.status === 'added') {
        createNewMarker(change.value.name());
      } else if (change.status === 'deleted') {
        //remove marker
        change.value.marker.setMap(null);
      }
    });
  }, null, 'arrayChange');

  //now that the subscription will handle marker creation, populate the locationList
  //read from local storage
  if (storedLocations && storedLocations.length > 0) {
    storedLocations.forEach(function(locationItem) {
      self.locationList.push(new Location(locationItem.name));
    });
  } else {
    //if there is no local storage, read from the initial locations list
    initialLocations.forEach(function(locationItem) {
      self.locationList.push(new Location(locationItem));
    });
  }

  //morePlaces holds the more places returned from google places api
  self.morePlaces = ko.observableArray([]);
  self.moreStatus = ko.observable('Getting More Places...');

  /**
   * gets more locations from google places api
   * uses nearbySearch for food within a radius of 5000 centered at the lat long location
   * this method sets the moreStatus observable based on success/ failure
   * it populates the morePlaces list with place names on success.
   */
  self.getMorePlaces = function() {
    // Specify location, radius and place types for your Places API search.
    var request = {
      location: new google.maps.LatLng(LATITUDE, LONGITUDE),
      radius: '5000',
      types: ['food']
    };

    //get a flat array of locations in the list, avoid duplicates
    var locationNames = ko.utils.arrayMap(self.locationList(), function(item) {
      return item.name();
    });

    //autocomplete
    $('#searchText').autocomplete({source: locationNames});

    // Create the PlaceService and send the request.
    // Handle the callback with an anonymous function.
    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, function(results, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        //success!
        self.moreStatus('More Places To Add:');
        results.forEach(function(result) {
          //skip the places already in the list
          if (locationNames.indexOf(result.name) == -1) {
            self.morePlaces.push({
              name: result.name
            });
          }
        });
      } else {
        //something went wrong with places request
        self.moreStatus('Unable to get more places at this time');
        console.log(status);
      }
    });
  };


  /**
   * Adds the location that user chose to the locationList
   */
  self.addPlace = function() {
    self.locationList.push(new Location(this.name));
    self.morePlaces.remove(this);
  };

  /**
   * Removes the location that user deleted from the list
   */
  self.removeLocation = function() {
    self.locationList.remove(this);
    self.morePlaces.push({
      name: this.name
    });
  };

  /**
   * handles the clicks from the listview.
   * call the corresponding map marker's handler
   */
  self.setCurrentLocation = function() {
    var marker = this.marker;
    var name = this.name();
    var address = this.address();
    //call the method in map.js
    activateMarker(marker, name, address);
  };

  /**
   * map.js got a google map places response and created a new marker,
   * and sent it to the ViewModel to add to the right location, so it is easy to filter locations
   */
  self.addMarker = function(marker, name, address) {
    ko.utils.arrayForEach(self.locationList(), function(loc) {
      if (loc.name() === name) {
        loc.marker = marker;
        loc.address = ko.observable(address);
      }
    });
  };

  /**
   * Filters the listviews and markers
   * @param {string} newValue - text that user is typing in
   * knockout calls subscribe whenever searchText is changed,
   * we need to show/ hide map markers and listview based on the searchText.
   */
  self.searchText.subscribe(function(newValue) {
    //filter the map markers here
    ko.utils.arrayForEach(self.locationList(), function(loc) {
      if (loc.marker) {
        if (newValue.length === 0 ||
          (loc.name().toUpperCase().search(newValue.toUpperCase()) >= 0)) {
          //show markers, but don't set if it is already visible
          if (loc.visibility() === false) {
            loc.visibility(true);
            loc.marker.setMap(map);
          }
        } else {
          //hide markers, but don't if they are already hidden.
          if (loc.visibility() === true) {
            loc.visibility(false);
            loc.marker.setMap(null);
          }
        }
      }
    });
  }, this);

  /** internal computed observable that fires whenever anything changes in our locationList
   * saves the place names in locationList in localStorage
   */
  ko.computed(function() {
    // store a clean copy to local storage - only keep the names
    //knockout goes crazy because of markers in the arrayList - copy only the names to a list and store it.
    var json = JSON.stringify(ko.utils.arrayMap(self.locationList(), function(item) {
      return {
        name: item.name()
      };
    }));
    localStorage.setItem('neighborhood-map', json);
  }.bind(this)).extend({
    rateLimit: {
      timeout: 500,
      method: 'notifyWhenChangesStop'
    }
  }); // save at most twice per second
};

// check local storage for locations
var storedLocations = ko.utils.parseJson(localStorage.getItem('neighborhood-map'));
var viewModel;

/**
 * called when the google script loads successfully
 * initialize maps, load the viewmodel and get more places from searchnearby
 */
function googleSuccess() {
  initializeMap();
  viewModel = new ViewModel();
  ko.applyBindings(viewModel);
  infoWindow = new google.maps.InfoWindow({
    content: ''
  });
  //get more places after a second,
  //or google maps api returns OVER_QUERY_LIMIT,
  //especially when there are too many locations from localstorage.
  setTimeout(function() {
    viewModel.getMorePlaces();
  }, 1000);
}

function googleError() {
  $('mapDiv').html('<h5>Unable to retrieve google maps</h5>');
}