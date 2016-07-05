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
var timeoutId = 0;

function handle_blank_input_error() {
  $error_text.text("Protip: No one likes you. Search for something asshat.");
}

function preLoader() {
  $loading_container.show();
  $search_submit.hide();
  $search_input.hide();
  $error_text.text("");
  $response_container.children().empty();
}

function afterLoad() {
  $loading_container.hide();
  $search_submit.show();
  $search_input.show();
}

function autocomplete(location_name) {
  gps_data = {"lat": lat, "lon": lon};
  look_up = '';
  $.ajax({
    url: "/autocomplete",
    type: "POST",
    data: { "location_name": location_name, "gps_data": gps_data },
    success: function(json) {
      // Clear out any past results
      $dataList.empty();

      // Loop over the JSON array.
      $.each(json, function(index, elem){
        // Create a new <option> element.
        var option = document.createElement('option');

        // Set the value using the item in the JSON array.
        var item = Object.keys(elem);
        option.value = item;
        option.id = elem[item];

        // Add the <option> element to the <datalist>.
        $dataList.append(option);
       });
    }
  });
}

function generate_location_data(location_name, location_id) {
  gps_data = {"lat": lat, "lon": lon};

  $.ajax({
    url: "/generate_location_data",
    type: "POST",
    data: { "location_name": location_name, "gps_data": gps_data, "location_id": location_id },
    beforeSend: function() {
      preLoader();
    },
    complete: function() {
      afterLoad();
    },
    success: function(json) {
      is_it_open = json.is_it_open.toString();
      closes_in  = json.closes_in.toString();
      opens_in   = json.opens_in.toString();
      name       = json.loc_name.toString();
      address    = json.address.toString();

      $('.error-text').text("");
      $('.location-open-data').text(opens_in);
      $('.location-close-data').text(closes_in);
      $('.location-name').text(name);
      $('.location-address').text(address);
    }
  });
}

function retrieve_gps_data() {
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(set_lat_lon);
  } else {
    console.log("navigator is not supported");
  }
}

function set_lat_lon(position) {
  lat = position.coords.latitude;
  lon = position.coords.longitude;
}

$( document ).on('ready page:load', function() {

  // Cached jQuery variables
  $search_submit = $('.location-search-submit');
  $search_input = $('.location-search-input');
  $loading_container = $('.loading-container');
  $dataList = $('#auto-complete-container');

  $response_container = $('.response-container');
  $error_text = $('.error-text');

  retrieve_gps_data();
  $loading_container.hide();

  // Listen for enter key and trigger functions
  document.querySelector('.location-search-input').addEventListener('keypress', function (e) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(processKeyPress, 500);

    function processKeyPress() {
      var locaiton_id = $dataList
      var location_name = $(".location-search-input").val();
      var key = e.which || e.keyCode;
      if (key === 13) {
        if (location_name == "") {
          handle_blank_input_error();
          $response_container.children().empty();

        } else {
          generate_location_data(location_name, "");
        }
      }
      else {
        autocomplete(location_name);
      }
    }
  });

  $search_input.on('input', function(e) {
    var val = $(this).val();
    var place_id = "";
    if (val.indexOf(" - ") > -1) {
      $.each($dataList.children(), function(idx, option) {
        if (option.value == $search_input.val()) {
          place_id = option.id;
        }
      });
      $search_input.val(val.split(' -')[0]);
      generate_location_data("", place_id);
    }
  });

  //
  // $search_input.on('change', function(e) {
  //   alert('changed!');
  // });

  $search_submit.on('click', function(e) {
    var location_name = $(".location-search-input").val();
    generate_location_data(location_name);
  });

});
