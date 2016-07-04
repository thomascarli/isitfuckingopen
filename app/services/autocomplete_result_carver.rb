class AutocompleteResultCarver

  def initialize(result)
    @result = result
  end

  def carve
    carve_autocomplete_json
  end

  private

  attr_reader :result

  def carve_autocomplete_json
    result.map {|place| { place.description => place.place_id } }
  end
end
