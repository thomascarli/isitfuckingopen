class LocationsController < ApplicationController
  def index
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
end
