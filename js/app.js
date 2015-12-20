/*jshint globalstrict: true*/
'use strict';
//Hard code city, latitude- longitude for now.
//This should be customizable later
var CITYNAME = 'Mansfield, MA';
var LATITUDE = 42.022082;
var LONGITUDE = -71.223725;

var initialLocations =
  [{
    name:"Cousin's Pizza & Subs",
    address:"660 East St, Mansfield, MA 02048, United States",
    lat:42.0315542,
    lng:-71.18795499999999,
    type:"food"
  },{
    name:"Bangkok Cafe",
    address:"369 Central St, Foxborough, MA 02035, United States",
    lat:42.03678749999999,
    lng:-71.23341640000001,
    type:"food"
  },{
    name:"Subway",
    address:"84 Copeland Dr, Mansfield, MA 02048, United States",
    lat:41.9780556,
    lng:-71.20260350000001,
    type:"food"
  },{
    name:"Jimmy's Pub",
    address:"141 North Main Street, Mansfield",
    lat:42.0279221,
    lng:-71.21753100000001,
    type:"food"
  },{
    name:"Mansfield Bank",
    address:"80 North Main Street, Mansfield",
    lat:42.0262793,
    lng:-71.21734249999997,
    type:"atm"
  },{
    name:"Sharon Credit Union",
    address:"100 Forbes Boulevard, Mansfield",
    lat:42.0315942,
    lng:-71.23731470000001,
    type:"atm"
  },{
    name:"Holiday Inn Mansfield-Foxboro Area",
    address:"31 Hampshire Street, Mansfield",
    lat:42.02803,
    lng:-71.24878100000001,
    type:"lodging"
  },{
    name:"Courtyard Boston Foxborough/Mansfield",
    address:"35 Foxborough Boulevard, Foxborough",
    lat:42.03986,
    lng:-71.236966,
    type:"lodging"
  },{
    name:"Red Roof Inn Boston – Mansfield/Foxboro",
    address:"60 Forbes Boulevard, Mansfield",
    lat:42.03407900000001,
    lng:-71.23666000000003,
    type:"lodging"
  }];

var map;
var infoWindow;

/**
 * Represents a location object.
 * @constructor
 * @param {string} name - name of the location
 */
var Location = function(name, address, lat, lng, type) {
  this.name = ko.observable(name);
  this.address = ko.observable(address);
  this.lat = ko.observable(lat);
  this.lng = ko.observable(lng);
  this.visibility = ko.observable(true);
  this.type = ko.observable(type);
  //mapmarker will be added to this later, when we create it.
};

/**
 * This is the viewmodel.
 * @constructor
 */
var ViewModel = function() {
  var self = this;

  self.$btnFood = $('#btn-food');
  self.$btnATM = $('#btn-atm');
  self.$btnLodging = $('#btn-lodging');

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
        var marker = createMarker (
          change.value.name(),
          change.value.address(),
          change.value.lat(),
          change.value.lng(),
          change.value.type());
        ko.utils.arrayForEach(self.locationList(), function(loc) {
          if (loc.name() === change.value.name()) {
            loc.marker = marker;
          }
        });
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
      self.locationList.push(
        new Location(locationItem.name,
          locationItem.address,
          locationItem.lat,
          locationItem.lng,
          locationItem.type));
    });
  } else {
    //if there is no local storage, read from the initial locations list
    initialLocations.forEach(function(locationItem) {
      self.locationList.push(
        new Location(locationItem.name,
          locationItem.address,
          locationItem.lat,
          locationItem.lng,
          locationItem.type));
    });
  }

  //get a flat array of locations in the list,
  //we can use this for autocomplete, and to avoid duplicates
  var locationNames = ko.utils.arrayMap(self.locationList(), function(item) {
    return item.name();
  });

/*  //autocomplete
  $('#searchText').autocomplete({
    appendTo: '#searchText',
    source: locationNames
  });
*/
  //morePlaces holds the more places returned from google places api
  self.morePlaces = ko.observableArray([]);
  self.moreStatus = ko.observable('');
  self.typeFilter = ko.observableArray(['food','atm','lodging']);

  /**
   * show/ hide the sidebar
   */
  self.toggleView = function(event) {
    $('nav').toggleClass('open');
   // event.stopPropagation();
  }
  /**
   * show/ hide food
   */
  self.toggleFood = function() {
    this.$btnFood.toggleClass('btn-success');
    this.$btnFood.toggleClass('btn-warning');
    self.toggleDisplay('food');
  };

  /**
   * show/ hide atms
   */
  self.toggleATM = function() {
    this.$btnATM.toggleClass('btn-success');
    this.$btnATM.toggleClass('btn-warning');
    self.toggleDisplay('atm');
  };

  /**
   * show/ hide lodgings
   */
  self.toggleLodging = function() {
    this.$btnLodging.toggleClass('btn-success');
    this.$btnLodging.toggleClass('btn-warning');
    self.toggleDisplay('lodging');
  };

  /**
   * show/ hide the selected category of locations
   */
  self.toggleDisplay = function(type) {
    if(self.typeFilter.indexOf(type)>=0) {
      self.typeFilter.remove(type);
    }
    else {
      self.typeFilter.push(type);
    }
  };
  /**
   * gets more locations from google places api
   * uses nearbySearch for food within a radius of 5000 centered at the lat long location
   * this method sets the moreStatus observable based on success/ failure
   * it populates the morePlaces list with place names on success.
   */
  self.findMorePlaces = function(type) {
    self.moreStatus = ko.observable('Getting More Places...');
    self.morePlaces.removeAll();
    // Specify location, radius and place types for your Places API search.
    var request = {
      location: new google.maps.LatLng(LATITUDE, LONGITUDE),
      radius: '5000',
      types: [type]
    };

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
              name: result.name,
              address: result.vicinity,
              lat: result.geometry.location.lat(),
              lng: result.geometry.location.lng(),
              type: type
            });
          }
        });
      } else {
        //something went wrong with places request
        self.moreStatus('Unable to get more places at this time');
      }
    });
  };


  /**
   * Adds the location that user chose to the locationList
   */
  self.addPlace = function() {
    self.locationList.push(new Location(this.name, this.address, this.lat, this.lng, this.type));
    self.morePlaces.remove(this);
  };

  /**
   * Removes the location that user deleted from the list
   */
  self.removeLocation = function() {
    self.locationList.remove(this);
    self.morePlaces.push({
      name: this.name,
      address: this.address,
      lat: this.lat,
      lng: this.lng,
      type: this.type
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
   * Filters the listviews and markers
   * @param {string} newValue - text that user is typing in
   * knockout calls subscribe whenever searchText is changed,
   * we need to show/ hide map markers and listview based on the searchText.
   */
  self.searchText.subscribe(function(newValue) {
    this.filterMarkers(newValue);
  }, this);

  self.filterMarkers = function(searchText) {
    //filter the map markers here
    ko.utils.arrayForEach(self.locationList(), function(loc) {
      if (loc.marker) {
        if ((searchText.length === 0 ||
          (loc.name().toUpperCase().search(searchText.toUpperCase()) >= 0)) &&
          self.typeFilter.indexOf(loc.type()) >= 0) {
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
  }

  /**
   * Filters the listviews and markers
   * knockout calls subscribe whenever searchText is changed,
   * we need to show/ hide map markers and listview based on the searchText.
   */

  self.typeFilter.subscribe(function(changes) {
    this.filterMarkers($('#searchText').val());
  }, this);

  /** internal computed observable that fires whenever anything changes in our locationList
   * saves the place names in locationList in localStorage
   */
  ko.computed(function() {
    // store a clean copy to local storage - only keep the names
    //knockout goes crazy because of markers in the arrayList - copy only the names to a list and store it.
    var json = JSON.stringify(ko.utils.arrayMap(self.locationList(), function(item) {
      return {
        name: item.name(),
        address: item.address(),
        lat: item.lat(),
        lng: item.lng(),
        type: item.type()
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
var storedData = localStorage.getItem('neighborhood-map');
var storedLocations = ko.utils.parseJson(storedData);
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

}

function googleError() {
  $('mapDiv').html('<h5>Unable to retrieve google maps</h5>');
}