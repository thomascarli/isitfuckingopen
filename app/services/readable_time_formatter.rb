class ReadableTimeFormatter

  def initialize(time, operation)
    @time       = time
    @operation  = operation
  end

  def format_time
    @mins, @secs = @time.divmod(60)
    @hrs, @mins = @mins.divmod(60)
    @hrs = @hrs.modulo(24)
    formatted_time = format_readable_time
  end

  private

  attr_reader :hrs, :mins, :secs, :operation

  def format_readable_time
    hours_time = hrs.zero? ? '' : hrs.to_s + ' hour'.pluralize(hrs) + ' '
    minutes_time = mins.zero? ? '' : mins.to_s + ' minute'.pluralize(mins)
    seconds_time = ' and ' + secs.round.to_s + ' seconds.'
    formatted_time = sentance_begining + hours_time + minutes_time + seconds_time
  end

  def sentance_begining
    "This shit is " + operation + " in "
  end
end
