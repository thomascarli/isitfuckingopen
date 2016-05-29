class LocationsController < ApplicationController
  def index
  end

  def generate_location_data
    location_data = parse_location_data(params)

    result = {"is_it_open": location_data[:open_data], "loc_name": location_data[:name], "address": location_data[:address]}

    respond_to do |format|
      format.json { render json: result}
    end
  end

  private

  def parse_location_data(params)
    lat   = params["gps_data"]["lat"]
    lon   = params["gps_data"]["lon"]
    name  = params["location_name"]
    location_data = {}

    vicinity = Geocoder.search(lat + ", " + lon).first.formatted_address
    query = name + " near " + vicinity
    location_id = client.spots_by_query(query).first.try(:place_id)

    if location_id.nil?
      location_data[:open_data] = "Fuck you, no results found."
    else
      location = client.spot(location_id)
      puts location
      location_data[:open_data] = get_opening_data(location.opening_hours)
      puts location_data[:open_data]
      location_data[:name]      = location.name
      location_data[:address]   = location.formatted_address
    end

    location_data
  end

  def get_opening_data(hours)
    if hours
      hours["open_now"]
    else
      "WE DON'T FUCKING KNOW"
    end
  end

  def client
    @client ||= GooglePlaces::Client.new(ENV['GOOGLE_ACCESS_KEY'])
  end
end
