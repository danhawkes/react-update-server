# react-update-server

> A server for react-native `*.jsbundle` updates

## About

React native apps can be updated by replacing the packaged `*.jsbundle` file.

This allows you to push updates as often as you like, without dealing with the app store review process and associated delay.

However, there's a constraint: the app __container__ needs to be compatible with the new bundle. This server allows you to map container versions to compatible bundles using a config file.

## API

`GET /update-check?{id}{platform}{container}{bundle}`

* id - bundle identifier/android app ID
* platform - 'ios' or 'android'
* container - Container version, e.g. '1.0.2'
* bundle - Bundle version, e.g '1.5.1'

E.g. `/update-check?id=com.example&platform=ios&container=1.0.2&bundle=1.5.1`

__Response `204`__

No update required/available.

__Response `302`__

A new version is available. The response is a redirect to the bundle location.

## Setup

### `data/config.json`

The config file is an array of 'spec' objects that define:
* The application ID,
* a [semver range][1] of compatible container versions,
* a bundle version, and
* an array of platforms to which the spec applies.

The plaforms array is optional, and if omitted is interpreted as meaning "all platforms". The full schema is [here][2].

E.g.

```json
[
  {
    "id": "com.example",
    "container": ">=1.0.0 <1.1.0",
    "bundle": "1.5.1",
    "platforms": ["ios", "android"]
  },
  {
    "id": "com.example",
    "container": "1.x.x",
    "bundle": "1.6.6"
  }
];
```

```
container 1.0.2 -> bundle 1.5.1
container 1.1.0 -> bundle 1.6.6
container 1.2.4 -> bundle 1.6.6
```

> Note: specs are evaluated in sequence and the first match is used. In the above example, container `1.1.0` resolves to `1.6.6` because it's not matched by the first spec. If the specs were reversed, all the examples would resolve to `1.6.6`.

### `data/bundles`

Bundles to serve are placed in the `data/bundles` directory. They're organised in an `app ID` -> `bundle version` -> `platform` hierarchy, and by convention the bundle is named `main.jsbundle`.

```
com.example
└── 1.6.6
    ├── android
    │   └── main.jsbundle
    └── ios
        └── main.jsbundle
```

## Running the server

_…with NPM:_

1. Copy your `data` directory into `src`
2. From `src`, run `npm start`

_…with docker:_

`docker run -i -t -p 80:80 -v <data-path>:/app/data danhawkes/react-update-server`

Where `<data-path>` is the path of a data directory to mount.

_…with [dokku][3]:_

This repo's ready to deploy via dokku. Basic steps are:
1. Clone the repo
2. Create your `data` directory and commit it
3. Add a dokku remote (e.g. `git remote add dokku dokku@example.com:react-update`)
4. Push to dokku: `git push dokku master`
        =====> Application deployed:
               http://react-update.example.com


[1]: https://github.com/npm/node-semver
[2]: docs/config_schema.json
[3]: http://dokku.viewdocs.io/dokku/
