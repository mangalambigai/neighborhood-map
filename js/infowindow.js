var foursquareurl = 'https://api.foursquare.com/v2/venues/search'+
  '?client_id='+foursquareclient+
  '&client_secret='+foursquaresecret+
  '&v=20130815'+
  '&limit=1'+
  '&near=Mansfield,MA'+
  '&query=';

  function activateMarker(marker, name, address) {
    infoWindow = infoWindow || new google.maps.InfoWindow({content: ''});
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      marker.setAnimation(null)
    }, 1500);

    var infotext = '<div><strong>'+name+'</strong></div><div>'+address+'</div>';
    var jqxhr = $.getJSON( foursquareurl+name, function(data){
        infotext += '<h6>Foursquare data:</h6>';
        var contact = data.response.venues[0].contact;
        for(var prop in contact) {
          if (contact.hasOwnProperty(prop)) {
            infotext += '<p><strong>'+prop+': </strong>'+contact[prop]+'</p>';
          }
        }
      }).fail(function(){
        infotext += 'unable to get Foursquare data :(';
      }).always(function(){
        infoWindow.setContent (infotext);
        infoWindow.open(map, marker);
      });
  }

