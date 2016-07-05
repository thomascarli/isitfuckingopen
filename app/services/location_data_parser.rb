class LocationDataParser

  def initialize(params)
    @location_id = params["location_id"]
    if @location_id.blank?
      @location_id = get_location_data(params["gps_data"]["lat"], params["gps_data"]["lon"], params["location_name"])
    end
  end

  def parse
    build_location_data_hash
  end

  private

  attr_reader :location_id

  def get_location_data(lat, lon, user_input)
    vicinity = Geocoder.search(lat + ", " + lon).first.formatted_address
    query = user_input + " near " + vicinity
    client.spots_by_query(query).first.try(:place_id)
  end

  def build_location_data_hash
    location_data = {}

    if location_id.nil?
      location_data[:open_data] = "Fuck you, no results found."
    else
      location = client.spot(location_id)
      location_data[:closing_time] = get_closing_data(location.opening_hours)
      location_data[:opening_time] = get_opening_data(location.opening_hours)
      location_data[:opens_in]     = get_opens_in(location_data[:opening_time])
      location_data[:closes_in]    = get_closes_in(location_data[:closing_time])
      location_data[:open_data]    = get_opening_bool(location.opening_hours)
      location_data[:name]         = location.name
      location_data[:address]      = location.formatted_address
    end

    location_data
  end

  def get_closes_in(time)
    if time
      seconds = Time.parse(time.insert(2, ":")) - Time.now.in_time_zone("Pacific Time (US & Canada)").time
      ::ReadableTimeFormatter.new(seconds, "closing").format_time
    end
  end

  def get_opens_in(time)
    if time
      seconds = Time.parse(time.insert(2, ":")) - Time.now.in_time_zone("Pacific Time (US & Canada)").time
      ::ReadableTimeFormatter.new(seconds, "opening").format_time
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
