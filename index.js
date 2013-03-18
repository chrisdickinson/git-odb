module.exports = odb

function odb() {
  return new ODB
}

function ODB() {
  this._write_backends = []
  this._read_backends = []
}

var cons = ODB
  , proto = cons.prototype

proto.add = function(backend, read_preference, write_preference) {
  if(backend.readable) {
    add_clamped(backend, this._read_backends, read_preference)
  }

  if(backend.writable) {
    add_clamped(backend, this._write_backends, write_preference)
  }

  return this
}

proto.remove = function(backend) {
  var idx
  idx = this._read_backends.indexOf(backend)
  if(idx > -1) {
    this._read_backends.splice(idx, 1)
  }
  idx = this._write_backends.indexOf(backend)
  if(idx > -1) {
    this._write_backends.splice(idx, 1)
  }

  return this
}

proto.find = function(sha, ready) {
  var found = false
    , pending = this._read_backends.length

  for(var i = 0, len = this._read_backends.length; !found && i < len; ++i) {
    this._read_backends[i].read(sha, gotsha)
  }

  return this

  function gotsha(err, data) {
    --pending
    if(found) {
      return
    }

    if(err) {
      found = true
      return ready(err)
    }

    if(data) {
      found = true
      return ready(null, data)
    }

    if(!pending) {
      return ready(null)
    }
  }
}

proto.save = function(sha, blob, ready) {
  if(!this._write_backends.length) {
    return ready(new Error('could not write due to lack of writable object databases'))
  }

  this._write_backends[0].write(sha, blob, ready)

  return this
}

function clamp(val, lo, hi) {
  return Math.min(Math.max(val, lo), hi)
}

function add_clamped(val, list, pref) {
  pref = pref === undefined ? 0 : list.length - pref
  pref = clamp(pref, 0, list.length)
  list.splice(pref, 0, val)
}
