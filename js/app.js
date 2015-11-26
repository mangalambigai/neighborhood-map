'use strict;'
var cityName = 'Mansfield, MA';
var allLocations = [
   'Quan\'s Kitchen',
   'Honey Dew Donuts',
   'Classic Pizza',
   'Dunkin\' Donuts',
   'Domino\'s Pizza',
   'Chipotle Mexican Grill',
   'Bertucci\'s',
   'Magic Pizza'
];


var map;
var infoWindow = new google.maps.InfoWindow({
  content: ''
});

//TODO:
//
//1. add json calls to apis
//2. load map with city zoomed in on load
//3.
//4. add, delete map markers
//5. persist map markers
//6. grunt for minifying
//7. responsive layout
//8. comments
//9. readme.md
//10. refactor

//constructor of our location object-
//each object will hold the name when constructed,
//address and the mapmarker will be added to this later, when we get the info back from maps places api.
var Location = function(data) {
  this.name = ko.observable(data);

  this.isSearched = ko.pureComputed(function(){
    if (viewModel.searchText().length==0)
      return true;

    if (this.name().toUpperCase().search(viewModel.searchText().toUpperCase())>=0)
      return true;

    return false;
  }, this);

};

var ViewModel = function() {
  var self = this;
  this.searchText = ko.observable("");

  //This is our list of list of location objects.
  this.locationList = ko.observableArray([]);
  allLocations.forEach(function(locationItem) {
    self.locationList.push(new Location(locationItem));
  });

  // setCurrentLocation handles the button clicks from the listview.
  // call the corresponding map marker's handler
  //TODO: this we get in this function is the location object - can we rely on this?
  this.setCurrentLocation = function(){
    var marker = this.marker;
    var name = this.name();
    var address = this.address;
    activateMarker(marker, name, address);
  };

  //we got a google map places response - a new marker is created,
  // add marker to the right location, so it is easy to filter locations
  this.addMarker = function(marker, name, address) {
    var numLocs = self.locationList().length;
    for(var i=0; i<numLocs; i++)
    {
      if (self.locationList()[i].name() == name)
      {
        self.locationList()[i].marker =marker;
        self.locationList()[i].address = address;
      }
    }
  };

  //knockout calls subscribe whenever searchText is called,
  //we need to show/ hide map markers based on the searchText.
  self.searchText.subscribe(function (newValue) {
    //filter the map markers here
    var numLocs = self.locationList().length;
    for(var i=0; i<numLocs; i++)
    {
      if (self.locationList()[i].marker)
      {
        if (self.locationList()[i].isSearched())
          self.locationList()[i].marker.setMap(map);
        else
          self.locationList()[i].marker.setMap(null);
      }
    }
  }, this);

};

var viewModel = new ViewModel();
ko.applyBindings(viewModel);
/*
//This is to activate the offcanvas sidebar for mobile
$(document).ready(function () {
  $('#toggleView').click(function () {
    $('#sidebar').toggleClass('active');
  });
});*/