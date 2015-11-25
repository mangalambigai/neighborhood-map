'use strict;'
var allLocations = [{
  name: 'Quans Kitchen',
  address: '30 Chauncy St, Ste 3, Mansfield, MA'
}, {
  name: 'Honey Dew Donuts',
  address: '99 Copeland Dr,Mansfield, MA'
}, {
  name: 'Classic Pizza',
  address: '242 Chauncy St, Ste 3, Mansfield, MA'
}, {
  name: 'Dunkin Donuts',
  address: '377 Chauncy St, Mansfield, MA 02048'
}, {
  name: 'Dominos Pizza',
  address: '235 Chauncy St, Mansfield, MA'
}];

//TODO:
//
//1. add json calls to apis
//2. add map marker animation
//3. ***filter map markers****
//4. add, delete map markers
//5. persist map markers
//6. grunt for minifying
//7. responsive layout
//8. comments
//9. readme.md
//10. refactor


var Location = function(data) {
  this.name = ko.observable(data.name);
  this.address = ko.observable(data.address);
};

var ViewModel = function() {
  var self = this;
  this.searchText = ko.observable("");
  this.locationList = ko.observableArray([]);
  allLocations.forEach(function(locationItem) {
    self.locationList.push(new Location(locationItem));
  });

  this.currentLocation = ko.observable(this.locationList[0]);

  this.setCurrentLocation = function(){
    self.currentLocation(this);
  }

  this.isSearched = ko.computed(function(data){
    //console.log(this);
    return (self.searchText().length==0);// || this.name().search(self.searchText())>=0);
  });

};

ko.applyBindings(new ViewModel());