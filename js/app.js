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
//2.
//3. make td clickable
//4. add, delete map markers
//5. persist map markers
//6. grunt for minifying
//7. responsive layout
//8. comments
//9. readme.md
//10. refactor

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

  this.locationList = ko.observableArray([]);
  allLocations.forEach(function(locationItem) {
    self.locationList.push(new Location(locationItem));
  });

  this.currentLocation = ko.observable();

  this.setCurrentLocation = function(){
    self.currentLocation(this);
    //TODO: refactor this:
    var marker = self.currentLocation().marker;
    var name = self.currentLocation().name();
    var address = self.currentLocation().address;

    marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function() {
        marker.setAnimation(null)
      }, 2000);

      infoWindow.setContent ('<div><strong>'+name+'</strong></div><div>'+address+'</div>');
      infoWindow.open(map, marker);
  };

  this.isSearched = ko.pureComputed(function(data){
    return (self.searchText().length==0);// || this.name().search(self.searchText())>=0);
  });

  this.addMarker = function(marker, name, address) {
    //todo add marker to the right location
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

  self.searchText.subscribe(function (newValue) {
    //filter the map markers here?
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

viewModel.currentLocation.subscribe(function (location){
// set the infowindow here
});