# git-odb

Git object database manager.

Manage reading and writing across several backends.

```javascript
var odb = require('git-odb')

var db = odb()

db.add({
  readable: maybe
, writable: maybe
, read: function(shaBuffer, ready) { }
, write: function(shaBuffer, object, ready) { }
}, readPreference, writePreference)

db.find(sha, function(err, obj) {

})

```

## API

#### odb.add(backend, readPreference = 0, writePreference = 0) -> odb

add a backend. if the backend is readable, add it to the list of read backends
using the `readPreference` (the higher the earlier it will be read from).

if the backend is writable, add it to the list of write backends. only the backend
at the front of the list will be used for writing.

#### odb.remove(backend) -> odb

remove the backend from reading and writing.

#### odb.find(shaBuffer, ready(err, rawGitObject)) -> odb

query all of the readable backends for an object matching `shaBuffer`.

call the callback with `err` if an error occurred in a backend, `undefined`
if the object wasn't found, or a `{type: numericGitType, data: Buffer}` representing
the object.

#### odb.save(shaBuffer, object, ready(err)) -> odb

save a new git object into this ODB using the write backend with the highest preference.

## License

MIT
