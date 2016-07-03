class ReadableTimeFormatter

  def initialize(time, operation)
    @time       = time
    @operation  = operation
  end

  def format_time
    @mins, @secs = @time.divmod(60)
    @hrs, @mins = @mins.divmod(60)
    @dys, @hrs = @hrs.divmod(24)
    formatted_time = format_readable_time
  end

  private

  attr_reader :dys, :hrs, :mins, :secs, :operation

  def format_readable_time
    days_time = dys.zero? ? '' : dys.to_s + ' day'.pluralize(dys) + ' '
    hours_time = hrs.zero? ? '' : hrs.to_s + ' hour'.pluralize(hrs) + ' '
    minutes_time = mins.zero? ? '' : mins.to_s + ' minute'.pluralize(mins)
    seconds_time = ' and ' + secs.round.to_s + ' seconds.'
    formatted_time = sentance_begining + days_time + hours_time + minutes_time + seconds_time
  end

  def sentance_begining
    "This shit is " + operation + " in "
  end
end
