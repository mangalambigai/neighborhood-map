
  function activateMarker(marker, name, address) {
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function() {
        marker.setAnimation(null)
      }, 1500);

      infoWindow.setContent ('<div><strong>'+name+'</strong></div><div>'+address+'</div>');
      infoWindow.open(map, marker);
  }

