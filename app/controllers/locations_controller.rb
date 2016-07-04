class LocationsController < ApplicationController
  def index
  end

  def autocomplete
    result = client.predictions_by_input(
      params["location_name"],
      lat: params["gps_data"]["lat"],
      lng: params["gps_data"]["lon"],
      radius: 160000
    )

    autocomplete_result = ::AutocompleteResultCarver.new(result).carve

    respond_to do |format|
      format.json { render json: autocomplete_result}
    end
  end

  def generate_location_data
    location_data = ::LocationDataParser.new(params).parse

    result = {
      "is_it_open": location_data[:open_data],
      "loc_name":   location_data[:name],
      "address":    location_data[:address],
      "closes_in":  location_data[:closes_in] || "",
      "opens_in":   location_data[:opens_in] || ""
    }

    respond_to do |format|
      format.json { render json: result}
    end
  end

  private

  def client
    @client ||= GooglePlaces::Client.new(ENV['GOOGLE_ACCESS_KEY'])
  end
end
