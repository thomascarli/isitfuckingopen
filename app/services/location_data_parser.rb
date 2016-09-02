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
      location_data[:time_closing] = get_closing_time_today(location_data[:closing_time])
      location_data[:time_opening] = get_opening_time_today(location_data[:opening_time])

    end

    location_data
  end

  def get_closing_time_today(time)
    if time
      Time.strptime(time.tr(':', ''), '%H%M').strftime("%Y/%m/%d %H:%M:%S")
    end
  end

  def get_opening_time_today(time)
    if time
      Time.strptime(time.tr(':', ''), '%H%M').strftime("%Y/%m/%d %H:%M:%S")
    end
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
    if hours["periods"]
      hours["periods"].map do |v| hours_hash[v[operation]["day"]] = v[operation]["time"] end
      hours_hash[Date.today.wday]
    elsif hours["weekday_text"]
      hours_hash = parse_weekday_text(hours["weekday_text"], hours_hash, operation)
    else
      false
    end
  end

  def parse_weekday_text(hours, hours_hash, operation)
    hours.map do |d|
      hours_hash[d.split(":", 2).first.downcase] = open_or_close_weekday_time(operation, d)
    end

    today = Date::DAYNAMES[Date.today.wday].downcase
    hours_hash[today]
  end

  def open_or_close_weekday_time(operation, day_string)
    new_hours = day_string.split(":", 2).last.split("AM", 2).each do |x| x.gsub!(/\D+/, '') end
    if operation == "open"
      new_hours.first.insert(0,"0") if new_hours.first.length == 3
    else
      (new_hours.last.to_i + 1200).to_s
    end
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
