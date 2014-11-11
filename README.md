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
```json
{
    "childId": "",
    "value": "",
    "type": "",
    "time":
}
```

* PUT `/radio/{id}` - Save device type.  Request is in the following form.
```json
{
    "childId": "",
    "device": ""
}
```

* PUT `/radio/{id}` - Save name of sketch on radio.  Request is in the following form.
```json
{
    "name": ""
}
```

* PUT `/radio/{id}` - Save version of sketch on radio.  Request is in the following form.
```json
{
    "version": ""
}
```

* PUT `/radio/{id}` - Save battery level of radio.  Request is in the following form.
```json
{
    "battery": ""
}
```

* POST `/log` - Create new log message.  Request is in the following form.
```json
{
    "message": ""
}
```