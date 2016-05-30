class LocationsController < ApplicationController
  def index
  end

  def generate_location_data
    location_data = parse_location_data(params)

    result = {
      "is_it_open": location_data[:open_data],
      "loc_name": location_data[:name],
      "address": location_data[:address],
      "closes_in": location_data[:closes_in]
    }

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
      location_data[:closing_time] = get_closing_data(location.opening_hours)
      location_data[:opening_time] = get_opening_data(location.opening_hours)
      location_data[:opens_in]     = get_closes_in(location_data[:opening_time])
      location_data[:closes_in]    = get_closes_in(location_data[:closing_time])
      location_data[:open_data]    = get_opening_bool(location.opening_hours)
      location_data[:name]         = location.name
      location_data[:address]      = location.formatted_address
    end

    location_data
  end

  def get_closes_in(time)
    if time
      Time.parse(time.insert(2, ":")) - Time.now.in_time_zone("Pacific Time (US & Canada)").time
    end
  end

  def get_opens_in(time)
    if time
      Time.parse(time.insert(2, ":")) - Time.now.in_time_zone("Pacific Time (US & Canada)").time
    end
  end

  def get_closing_data(hours)
    if hours && hours["open_now"]
      calculate_operation_time(hours, "close")
    else
      false
    end
  end

  def get_opening_data(hours)
    if hours && hours["open_now"]
      false
    else
      calculate_operation_time(hours, "open")
    end
  end

  def calculate_operation_time(hours, operation)
    hours_hash = {}
    hours["periods"].map do |v| hours_hash[v[operation]["day"]] = v[operation]["time"] end
    hours_hash[Date.today.wday]
  end

  def get_opening_bool(hours)
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
