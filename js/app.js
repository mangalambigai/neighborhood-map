'use strict';
//Hard code city, latitude- longitude for now.
//This should be customizable later
var cityName = 'Mansfield, MA';
var lat = 42.022082;
var lng = -71.223725;

var allLocations = [
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

//constructor of our location object-
//each object will hold the name when constructed,
//address and the mapmarker will be added to this later, when we get the info back from maps places api.
var Location = function(data) {
  this.name = ko.observable(data);
  this.visibility = ko.observable(true);
};

Location.prototype.toJSON = function() {
  return ko.utils.unwrapObservable({
    name: this.name
  });
};

var ViewModel = function() {
  var self = this;
  this.searchText = ko.observable("");

  //This is our list of list of location objects.
  this.locationList = ko.observableArray();

  this.locationList.subscribe(function(changes) {
    changes.forEach(function(change) {
      if (change.status == 'added') {
        createNewMarker(change.value.name());
        //createNewMarker(change.name);
      } else if (change.status == 'deleted') {
        //remove marker
        change.value.marker.setMap(null);
      }
    });
  }, null, "arrayChange");

  //read from local storage
  if (storedLocations && storedLocations.length > 0) {
    storedLocations.forEach(function(locationItem) {
      self.locationList.push(new Location(locationItem.name));
    });
  } else {
    //if there is no local storage, read from the alllocations list
    allLocations.forEach(function(locationItem) {
      self.locationList.push(new Location(locationItem));
    });
  }

  //This holds the more places returned from google places api
  this.moreplaces = ko.observableArray([]);

  //Get more locations from google places
  // Specify location, radius and place types for your Places API search.
  var request = {
    location: new google.maps.LatLng(lat, lng),
    radius: '5000',
    types: ['food']
  };

  this.moreStatus = ko.observable('Getting More Places...');
  this.getMorePlaces = function() {
    // Create the PlaceService and send the request.
    // Handle the callback with an anonymous function.
    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, function(results, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        self.moreStatus('More Places To Add:');
        for (var i = 0; i < results.length; i++) {
          self.moreplaces.push({
            name: results[i].name
          });
        }
      } else {
        self.moreStatus('Unable to get more places at this time');
        console.log(status);
      }
    });
  };

  //Add more locations from google places
  this.addPlace = function() {
    //console.log(this);
    self.locationList.push(new Location(this.name));
  };

  //Remove the location from the list
  this.removeLocation = function() {
    self.locationList.remove(this);
  };
  // setCurrentLocation handles the button clicks from the listview.
  // call the corresponding map marker's handler
  // TODO: this we get in this function is the location object - can we rely on this?
  this.setCurrentLocation = function() {
    var marker = this.marker;
    var name = this.name();
    var address = this.address();
    activateMarker(marker, name, address);
  };

  // we got a google map places response - a new marker is created,
  // add marker to the right location, so it is easy to filter locations
  this.addMarker = function(marker, name, address) {
    var numLocs = self.locationList().length;
    for (var i = 0; i < numLocs; i++) {
      if (self.locationList()[i].name() == name) {
        self.locationList()[i].marker = marker;
        self.locationList()[i].address = ko.observable(address);
      }
    }
  };

  // This is where the filtering happens.
  // knockout calls subscribe whenever searchText is changed,
  // we need to show/ hide map markers and listview based on the searchText.
  self.searchText.subscribe(function(newValue) {
    //filter the map markers here
    var numLocs = self.locationList().length;
    for (var i = 0; i < numLocs; i++) {
      if (self.locationList()[i].marker) {
        var loc = self.locationList()[i];
        if (newValue.length === 0 ||
          (self.locationList()[i].name().toUpperCase().search(newValue.toUpperCase()) >= 0)) {
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
    }
  }, this);

  // internal computed observable that fires whenever anything changes in our todos
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

// check local storage for todos
var storedLocations = ko.utils.parseJson(localStorage.getItem('neighborhood-map'));
var viewModel;

function googleSuccess() {
  initializeMap();
  viewModel = new ViewModel();
  ko.applyBindings(viewModel);
  infoWindow = new google.maps.InfoWindow({
    content: ''
  });

  //get more places after a second, or google maps api returns OVER_QUERY_LIMIT!!
  setTimeout(function() {
    viewModel.getMorePlaces();
  }, 1000);

}

function googleError() {
  $('mapDiv').html('<h5>Unable to retrieve google maps</h5>');
}