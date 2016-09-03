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
var linkTest = '';
var lat = "";
var lon = "";
var timeoutId = 0;

function handle_blank_input_error() {
  $error_text.text("Protip: No one likes you. Search for something asshat.");
}

function preLoader() {
  $loading_container.show();
  $searh_container.hide();
  $error_text.text("");
  $response_container.children().empty();
}

function afterLoad() {
  $loading_container.hide();
  $searh_container.show();
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

        // Set the value using the item in the JSON array.
        var item = Object.keys(elem);
        
        // Create a new <li> element.
        var option = document.createElement('li');
        option.type = item;
        option.id = elem[item];

        var link = document.createElement('a');
        link.href = '#';
        link.textContent = item;

        //push <a> into <li>
        option.appendChild(link);
        
        // Add the <li> elements to the <ul auto-complete-container>
        $dataList.append(option);
       });
    }
  });
  $dataList.slideToggle('slow');
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
      // Maybe we don't need to show the name? 
      //$('.location-name').text(name);
      $('.open-or-no').text(is_it_open);
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
  $search_input = $('.location-search-input');
  $searh_container = $('.search-container');
  $loading_container = $('.loading-container');
  $dataList = $('#auto-complete-container');
  $response_container = $('.response-container');
  $error_text = $('.error-text');

  // Initializers on ready
  $dataList.hide();
  retrieve_gps_data();
  $loading_container.hide();

  // Listen for enter key and trigger functions
  document.querySelector('.location-search-input').addEventListener('keyup', function (e) {
    $dataList.hide();
    $error_text.toggle();
    $response_container.children().empty();

    clearTimeout(timeoutId);
    timeoutId = setTimeout(processKeyPress, 500);

    function processKeyPress() {
      var location_name = $(".location-search-input").val();
      var key = e.which || e.keyCode;
      // Get location when enter key is pressed
      if (key === 13) {
        if (location_name == "") {
          handle_blank_input_error();
          $response_container.children().empty();

        } else {
          console.log(location_name);
          generate_location_data(location_name, "");
        }
      } else if (location_name == "") {
          handle_blank_input_error();
          $response_container.children().empty();
          $dataList.hide();
      }
      // Gets location when user id done tying and doesnt press enter.
      else {
        autocomplete(location_name);
      }
    }
  });

  // Toggle autocomplete results when drop-down-btn is clicked
  $('.drop-down-btn').on('click', function(){
    $dataList.slideToggle('slow');
  });


  
  // EvenListener, watch auto-complete-container for selection
  document.getElementById('auto-complete-container').addEventListener('click', function(e) {
    e.preventDefault();
    if (e.target.nodeName === 'A') {
      place = e.target.textContent.split(' -')[0];
      // update input bar for aesthetics
      $search_input.val(place);
      // parse out the id of place and seach
      generate_location_data('', e.target.parentElement.id);
      $dataList.hide();
    }
  });


  // FUCNTION ABOVE REPLACES LOGIC FOR ' - '
  // $search_input.on('input', function(e) {
  //   var val = $(this).val();
  //   console.log('val is now: ' + val);
  //   var place_id = "";

  //   if (val.indexOf(" - ") > -1) {
  //     $.each($dataList.children(), function(idx, option) {
  //       if (option.type == $search_input.val()) {
  //         place_id = option.id;
  //       }
  //     });
  //     $search_input.val(val.split(' -')[0]);
  //     generate_location_data("", place_id);
  //   } else {
  //     console.log('-1 is greater then val!');
  //     $dataList.hide();
  //   }
  // });



});
