class LocationsController < ApplicationController
  def index
  	@client = GooglePlaces::Client.new(ENV['google_access_key'])
	@spots = @client.spots(-33.8670522, 151.1957362, :types => 'restaurant')
  end

  def show

  end



end
