class LocationsController < ApplicationController
  def index
  end

  def generate_location_data
    location_data = parse_location_data(params)

    result = {"is_it_open": location_data[:open_data]}

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

    location_id = client.spots(lat, lon, name: name).first.try(:place_id)
    if location_id.nil?
      location_data[:open_data] = "Fuck you, no results found."
    else
      location = client.spot(location_id)
      location_data[:open_data] = location.opening_hours["open_now"]
    end

    location_data
  end

  def client
    @client ||= GooglePlaces::Client.new(ENV['GOOGLE_ACCESS_KEY'])
  end
end
