jenny
=====

Jenny tells a remote server whats happening with your MySensors connected via a serial port


## Usage

```sh
jenny -u http://site.com/path -p /serial/port
```


## Routes

* POST `/radio` - Register a new radio, expects to have the following response:
```json
{
    "id": ""
}
```

* PUT `/radio/{id}` - Save data for radio.  Request is in the following form.
All values are optional
```json
{
    "name": "",
    "version": "",
    "battery": ""
}
```

* POST `/radio/{id}/sensor/{childId}/reading` - Save sensor readings for this radio and sensor
```json
{
    "type": "",
    "value": "",
    "time": ""
}
```

* PUT `/radio/{id}/sensor/{childId}` - modify sensor information.  All values are optional.
```json
{
    "type": "",
    "name": ""
}
```

* POST `/log` - Create new log message.  Request is in the following form.
```json
{
    "message": "",
    "time": ""
}
```
