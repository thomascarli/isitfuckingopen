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

function generate_location_data(location_name) {
  gps_data = retrieve_gps_data();

  $.ajax({
    url: "/generate_location_data",
    type: "POST",
    data: { "location_name": location_name, "gps_data": gps_data },
    success: function(json) {
      var is_it_open = json.is_it_open.toString();
      $('.location-open-data').text(is_it_open);
    }
  });
}

function retrieve_gps_data() {
  // Eventually this will be browsers location data -TC
  return {"lat": -33.8670522, "lon": 151.1957362}
}

$( document ).on('ready page:load', function() {

  $(".location-search-submit").on('click', function(e) {
    var location_name = $(".location-search-input").val();
    generate_location_data(location_name);
  });

});
