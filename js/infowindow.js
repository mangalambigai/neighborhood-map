var foursquareurl = 'https://api.foursquare.com/v2/venues/search'+
  '?client_id=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'+
  '&client_secret=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'+
  '&v=20130815'+
  '&limit=1'+
  '&near=Mansfield,MA'+
  '&query=';

  function activateMarker(marker, name, address) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      marker.setAnimation(null)
    }, 1500);

    var infotext = '<div><strong>'+name+'</strong></div><div>'+address+'</div>';
      $.getJSON(foursquareurl+name, function(data){
        infotext += '<h6>Foursquare data:</h6>';
        var contact = data.response.venues[0].contact;
        for(var prop in contact) {
          if (contact.hasOwnProperty(prop)) {
            infotext += '<p><strong>'+prop+':</strong>'+contact[prop]+'</p>';
          }
        }
        infoWindow.setContent (infotext);
        infoWindow.open(map, marker);
      });
  }

