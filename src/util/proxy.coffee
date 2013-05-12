# The **Proxy** object is a possibly poorly-name object that wraps any single
# value in a wrapper that can event wher said value changes. Often it is used by
# Model objects to wrap an attribute for binding against a View, and in fact
# Models provide a method to do so.
#
# The expectation is that upon spawning a `Proxy`, one will use the proxy's
# `listenTo` and `setValue` methods in conjuction to trigger updates. This may
# seem like a strange amount of stuff for a consumer to manage, but the API
# becomes a bit of a mess otherwise. And, Model objects do this legwork
# automatically.

Base = require('../core/base').Base
util = require('../util/util')

# Use Base so that we inherit its EventEmitter defaults
class Proxy extends Base
  # Creates a new Proxy. The following options may be supplied:
  #
  # - `value`: The initial value of the Proxy.
  # - `transform`: A function that transforms the value before passing it on if
  #   desired.
  #
  constructor: ({ @value, @transform }) ->

  # Sets the value of this Proxy and triggers the relevant events.
  #
  # **Returns** the new value.
  setValue: (value) ->
    oldValue = value

    # Perform a transformation if we're expected to.
    value = this.transform(value) if this.transform?

    # Update and event if the value has indeed changed.
    if value isnt oldValue
      this.value = value
      this.emit('changed', value, oldValue)

    value

# A ComboProxy takes multiple Proxy objects and puts their values together.
# It doesn't itself listen to anything but Proxies directly.
class ComboProxy extends Proxy

  # Unlike the base `Proxy`, this one simply takes the array of Proxies and a
  # `transform` function for combining the results of those proxies.
  constructor: (@proxies = [], @transform = (values...) -> values.join()) ->
    # Init our values array. It'll get actual values when we call `update` in
    # just a bit here.
    values = []

    # Listen to all our proxies for updates.
    for proxy, i in this.proxies
      proxy.on 'changed', (value) =>
        values[i] = value
        this.update()

    # We'll update immediately to set our initial state.
    this.update()

  # Call our transform func for combining, then just rely on `setValue` for the
  # rest of the behavior
  #
  # **Returns** the new value.
  update: -> this.setValue(this.transform.apply(this, this.values))

# Export.
util.extend(module.exports,
  Proxy: Proxy
  ComboProxy: ComboProxy
)

