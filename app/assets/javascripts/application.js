// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require turbolinks
//= require_tree .

var lat = "";
var lon = "";


function generate_location_data(location_name) {
  gps_data = {"lat": lat, "lon": lon};

  $.ajax({
    url: "/generate_location_data",
    type: "POST",
    data: { "location_name": location_name, "gps_data": gps_data },
    success: function(json) {
      is_it_open = json.is_it_open.toString();
      name = json.loc_name.toString();
      address = json.address.toString();

      $('.location-open-data').text(is_it_open);
      $('.location-name').text(name);
      $('.location-address').text(address);
    }
  });
}

function retrieve_gps_data() {


  // Get Geo Location
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(function(position) {
      lat = position.coords.latitude;
      lon = position.coords.longitude;
    });
  } else {
    console.log("navigator is not supported");
  }

  // Eventually this will be browsers location data -TC
}

$( document ).on('ready page:load', function() {

  retrieve_gps_data();

  $(".location-search-submit").on('click', function(e) {
    retrieve_gps_data();
    console.log(lat);
    console.log(lon);
    var location_name = $(".location-search-input").val();
    generate_location_data(location_name);
  });

});
