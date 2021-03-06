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

function write_user_error_msg(msg) {
  var message = msg || 'Protip: No one likes you. Search for something asshat.';
  $error_text.text(message);
  $error_text.show();
  $error_text.fadeOut(3700);

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
      $dataList.slideToggle('slow');
    }
  });
}

$.fn.extend({
    animateCss: function (animationName) {
        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        this.addClass('animated ' + animationName).one(animationEnd, function() {
            $(this).removeClass('animated ' + animationName);
        });
    }
});

function generate_location_data(location_name, location_id) {
  gps_data = {"lat": lat, "lon": lon};

  $.ajax({
    url: "/generate_location_data",
    type: "POST",
    data: { "location_name": location_name, "gps_data": gps_data, "location_id": location_id },
    beforeSend: function() {
      // preLoader();
    },
    complete: function() {
      afterLoad();
    },
    success: function(json) {
      is_it_open   = json.is_it_open.toString();
      closes_in    = json.closes_in.toString();
      opens_in     = json.opens_in.toString();
      name         = json.loc_name.toString();
      address      = json.address.toString();
      time_closing = json.time_closing.toString();
      time_opening = json.time_opening.toString();

      $('.error-text').text("");
      //$('.location-open-data').text(opens_in);

      if (time_closing != "") {
        set_close_timer(time_closing);
      }

      if (time_opening != "") {
        set_open_timer(time_opening);
      }
      //$('.location-close-data').text(closes_in);
      // Maybe we don't need to show the name?
      //$('.location-name').text(name);
      $('.open-or-no').text(is_it_open).fadeIn(1000);

      $('.bottom-plus').fadeIn(500);

    },
    error: function(){
      write_user_error_msg('I cant find that shit. Search some other shit!');
    }
  });
}

function set_close_timer(closes_in) {
  $('.location-close-data').countdown(closes_in, function(event, text) {
    $(this).html(event.strftime('in %H hours %M minutes and %S seconds'));
    $(this).html("This shit is closing " + $(this).html());
  }).on('finish.countdown', function() {
    $('.open-or-no').hide();
    $(this).html("You fucked up.  This shit is closed as fuck.");
  });
}

function set_open_timer(opening_in) {
  $('.location-close-data').countdown(opening_in, function(event, text) {
    $(this).html(event.strftime('in %H hours %M minutes and %S seconds'));
    $(this).html("This shit is opening " + $(this).html());
  }).on('finish.countdown', function() {
    $('.open-or-no').hide();
    $(this).html("Go get your shit.  This place is fucking open.");
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
  $('.search-container').hide();
  $('.open-or-no').hide();
  $('.location-close-data').hide();

  // Loading bar timeout function to load gps coords
  var progress = 0;
  var plus_or_minus = 0;
  timeout = window.setInterval(function(){
    if (progress == 106) {
      $("progress").hide();
      $('.search-container').slideToggle('slow');
      clearTimeout(timeout);
    } else {
      $("progress").val(progress);
      progress = progress + 1;
    }
  }, 25);

  // Cached jQuery variables
  $search_input      = $('.location-search-input');
  $searh_container   = $('.search-container');
  $loading_container = $('.loading-container');
  $dataList          = $('#auto-complete-container');
  $open_or_no        = $('.open-or-no');
  $bottom_plus       = $('.bottom-plus');

  $response_container = $('.response-container');
  $error_text = $('.error-text');

  // Initializers on ready
  $dataList.hide();
  retrieve_gps_data();
  $loading_container.hide();

  //Listen for click of plus icon to expand to access additional dataList
  $bottom_plus.on('click', function() {
    if(plus_or_minus == 0) {
      $('.location-close-data').slideToggle('slow');
      $bottom_plus.addClass('fa-minus-circle');
      $bottom_plus.removeClass('fa-clock-o');
      plus_or_minus = 1;
    } else {
      $('.location-close-data').slideToggle('slow');
      $bottom_plus.addClass('fa-clock-o');
      $bottom_plus.removeClass('fa-minus-circle');
      plus_or_minus = 0;
    }
  });

  $open_or_no.on('click', function() {
    var font_array = ['dom', 'staravenue', 'iarnold','hashtag', 'sunshine',' back to black','espresso', 'doodlegum'];
    var random_elem = font_array[Math.floor(Math.random() * font_array.length)];
    $open_or_no.animateCss('shake');
    //$open_or_no.css('font-family', random_elem);

  })

  // Listen for enter key and trigger functions
  document.querySelector('.location-search-input').addEventListener('keyup', function (e) {
    $dataList.fadeOut();
    $error_text.text("");
    $response_container.children().empty();

    clearTimeout(timeoutId);
    timeoutId = setTimeout(processKeyPress, 500);

    function processKeyPress() {
      var location_name = $(".location-search-input").val();
      var key = e.which || e.keyCode;
      // Get location when enter key is pressed
      if (key === 13) {
        if (location_name == "") {
          $bottom_plus.fadeOut();
          write_user_error_msg();
          $response_container.children().empty();

        } else {
          generate_location_data(location_name, "");
        }
      } else if (location_name == "") {
          write_user_error_msg();
          $response_container.children().empty();
          $dataList.hide();
          $bottom_plus.fadeOut();
      }
      // Gets location when user id done tying and doesnt press enter.
      else {
        autocomplete(location_name);
      }
    }
  });

  // Toggle autocomplete results when drop-down-btn is clicked
  $('.drop-down-btn').on('click', function(){
    if ($dataList.children().length === 0) {
      return;
    } else {
      $dataList.slideToggle('slow');
    }
  });



  // EvenListener, watch auto-complete-container for selection
  document.getElementById('auto-complete-container').addEventListener('click', function(e) {
    e.preventDefault();
    if (e.target.nodeName === 'A') {
      place = e.target.textContent.split(' -')[0];
      // update input bar for aesthetics
      $search_input.val(place);
      // parse out the id of place and seach
      $dataList.slideToggle('slow');
      generate_location_data('', e.target.parentElement.id);
    }
  });

});
