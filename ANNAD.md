
## Lesa inn skrár með loader.js

Til að lesa inn skrár með loader.js, getur maður kallað á,

Til þess að lesa myndirnar `img/fire.png`, `img/floorSpritesheet.png`, og textaskrárnar `txt/path/to/textfile.txt` og
`readme.txt`, kallar maður á `load` fallið í loader.js,

```JavaScript
loader.load({
  image: {
    fire: "img/fire.png",
    floor: "img/floorSpritesheet.png"
  },
  text: {
    textfile1: "txt/path/to/textfile.txt",
    readme: "readme.txt"
  }
}, callback);

```

Eftir að `loader` er búinn að klára að sækja skrárnar er kallað á `callback` fallið,

```JavaScript
function callback(assets) {
  // ...
}
```

Þá lítur assets parameter-inn svona út

```JavaScript
{
  image: {
    fire: <Image>,
    floor: <Image>
  },
  text: {
    textfile1: "....",
    readme: "...."
  }
}
```

## Lesa inn skrár með assetLoader.js

assetLoader notar loader-inn hér að ofan innbyrgðis, en er aðeins öflugari, hann les inn JSON á sem
eru svona í forminu:

```JSON
"assets": {
    "textureAtlas": {
        "dungeon": {
            "dep": ["raw.image.dungeon"],
            "cfg": {
                "image": "raw.image.dungeon",
                "tileWidth": 16,
                "tileHeight": 16
            }
        },
        "explosion": {
            "dep": ["raw.image.explosion"],
            "cfg": {
                "image": "raw.image.explosion",
                "tileWidth": 100,
                "tileHeight": 100,
                "nrOfTiles": 74,
                "primaryDirection": "right",
                "secondaryDirection": "down"
            }
        }
    },
    "texture": {
        "background": {
            "dep": ["textureAtlas.dungeon"],
            "cfg": {
                "image": {
                    "target": "textureAtlas.dungeon",
                    "coordinate": [1, 6]
                },
                "scale": 4
            }
        }
    },
    "sequence": {
        "explosion": {
            "dep": ["textureAtlas.explosion"],
            "cfg": {
                "all": true,
                "primaryDirection": "right",
                "secondaryDirection": "down",
                "textureAtlas": "textureAtlas.explosion"
            }
        }
    },
    "sprite": {
        "rock": {
            "dep": ["raw.image.rock"],
            "cfg": {
                "image": "raw.image.rock"
            }
        },
        "bullet": {
            "dep": ["raw.image.bullet"],
            "cfg": {
                "scale": 0.15,
                "image": "raw.image.bullet"
            }
        }
    },
    "tiledMap": {
        "tm1": {
            "dep": [
                "raw.xml.pmap1",
                "tiledTileset.map1tileset1",
                "tiledTileset.map1tileset2",
                "tiledTileset.map1tileset3"
            ],
            "cfg": {
                "type": 1,
                "map": "raw.xml.pmap1",
                "tilesets": [
                    "tiledTileset.map1tileset2",
                    "tiledTileset.map1tileset3",
                    "tiledTileset.map1tileset1"
                ]
            }
        }
    },
    "tiledTileset": {
        "map1tileset1": {
            "dep": [
                "raw.xml.pmap1tileset1", 
                "textureAtlas.spritesheet1"
            ],
            "cfg": {
                "textureAtlas": "textureAtlas.spritesheet1",
                "cfg": "raw.xml.pmap1tileset1"
            }
        },
        "map1tileset2": {
            "dep": [
                "raw.xml.pmap1tileset2", 
                "textureAtlas.tileset4"
            ],
            "cfg": {
                "textureAtlas": "textureAtlas.tileset4",
                "cfg": "raw.xml.pmap1tileset2"
            }
        }
    },
    "fastImage": {
        "cursor": {
            "dep": ["raw.image.cursor"],
            "cfg": {
                "image": "raw.image.cursor"
            }
        }
    },
    "raw": {
        "image": [{
            "prefix": "img/",
            "paths": {
                "cursor": "cursor.png",
                "rock": "rock.png",
                "blood": "blood.png",
                "bullet": "bullet.png",
                "rifle": "survivor-shoot_rifle_0.png",
                "blockMap": "block-map.png",
                "donkey": "notdonkey.png",
                "crosshair": "crosshair.png"
            }
        }, {
            "prefix": "img/spritesheets/explosions/",
            "paths": {
                "explosion": "spritesheet1.png",
                "explosionSpritesheet2": "explosionSpritesheet2.png",
                "explosionSpritesheet3": "explosionSpritesheet3.png",
                "explosionSpritesheet5": "explosionSpritesheet5.png",
                "explosionSpritesheet6": "explosionSpritesheet6.png"
            }
        }],
        "audio": [{
            "prefix": "audio/",
            "paths": {
                "bulletFire": "bulletFire.ogg",
                "bulletZapped": "bulletZapped.ogg",
                "rockEvapoate": "rockEvaporate.ogg",
                "rockSplit": "rockSplit.ogg",
                "dying": "dying.ogg",
                "gunsound1": "gunsound1.ogg",
                "running1": "running1.ogg",
                "impact1": "impact1.ogg",
                "explosion1": "explosion.ogg",
                "clawing": "clawing.ogg"
            }
        }],
        "text": [{
            "prefix": "glsl/",
            "paths": {
                "lights": "lights.vert",
                "shadowMap": "shadowMap.frag",
                "shadowMask": "shadowMask.frag"
            }
        }],
        "json": [{
            "prefix": "json/",
            "paths": {}
        }],
        "xml": [{
            "prefix": "xml/map1/",
            "paths": {
                "pmap1": "map1.tmx",
                "pmap1tileset1": "map1-tileset1.tsx",
                "pmap1tileset2": "map1-tileset2.tsx",
                "pmap1tileset3": "map1-tileset3.tsx"
            }
        }]
    }
}
```

Allt sem er í assets.raw flokkast sem "hráar" skrár sem þarf að sækja af tölvunni.  "prefix" gerir það að verkum
að tilgreindur streng er viðskeytt vinstra megin við slóðirnar, t.d.

```JSON
"xml": [{
    "prefix": "xml/map1/",
    "paths": {
        "pmap1": "map1.tmx",
        "pmap1tileset1": "map1-tileset1.tsx",
        "pmap1tileset2": "map1-tileset2.tsx",
        "pmap1tileset3": "map1-tileset3.tsx"
    }
}]
```

jafngildi

```JSON
"xml": [{
    "paths": {
        "pmap1": "xml/map1/map1.tmx",
        "pmap1tileset1": "xml/map1/map1-tileset1.tsx",
        "pmap1tileset2": "xml/map1/map1-tileset2.tsx",
        "pmap1tileset3": "xml/map1/map1-tileset3.tsx"
    }
}]
```


Kallað er svona á fallið,

```JavaScript

jsonObject = { /* ... */ };

assetLoader.load(jsonObject, callback);

// ...

function callback(response) { /* ... */ }
```

þar sem response væri á forminu

```JavaScript
{
  urls: {},
  assets: {}
}
```

Tökum sem dæmi assets.tiledMap.tm1 sem lítur svona út

```JSON
"tm1": {
    "dep": [
        "raw.xml.pmap1",
        "tiledTileset.map1tileset1",
        "tiledTileset.map1tileset2",
        "tiledTileset.map1tileset3"
    ],
    "cfg": {
        "type": 1,
        "map": "raw.xml.pmap1",
        "tilesets": [
            "tiledTileset.map1tileset2",
            "tiledTileset.map1tileset3",
            "tiledTileset.map1tileset1"
        ]
    }
}
```

tm1 er hlutur sem tilheyrir "klasanum" TiledMap (sem er í TiledMap.js).  `"dep": [...]` eru dependencies sem þurfa að vera til áður en hægt er að smíða þennan hlut.  Um leið öll dependencies eru komin þá eru öllum tilvikum af strengjum í `"cfg"` sem eru að finna í `"dep": [ ... ]` skipt út fyrir samsvarandi hlut.  Að lokum er kallað á `new TiledMap(cfg)`.


