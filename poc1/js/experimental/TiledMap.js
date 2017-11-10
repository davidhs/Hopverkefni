'use strict';

function TiledMap(cfg) {
  const map = util.xml2json(cfg.map).map;
  const tilesets = cfg.tilesets;

  // Width in tiles
  const width = parseInt(map['@attributes'].width, 10);
  const height = parseInt(map['@attributes'].height, 10);

  this.widthInTiles = width;
  this.heightInTiles = height;

  // Width in pixels
  const tileWidth = parseInt(map['@attributes'].tilewidth, 10);
  const tileHeight = parseInt(map['@attributes'].tileheight, 10);

  this.tileWidth = tileWidth;
  this.tileHeight = tileHeight;

  const data2Ds = [];

  const layers = Array.isArray(map.layer) ? map.layer : [map.layer];
  this.layers = layers;

  // BOTTOM (BACKGROUND) LAYERS
  this.isBottomLayer = {};


  // MIDDLE LAYERS (CAST SHADOWS)
  this.isMiddleLayer = {};

  // TOP LAYERS (OVERHEAD)
  this.isTopLayer = {};

  for (let i = 0; i < layers.length; i += 1) {
    const layer = layers[i];
    const name = this._getLayerName(layer);


    // LAYER TYPE

    const atr = layer.properties.property['@attributes'];
    if (atr.name === 'level') {
      const lvl = parseInt(atr.value, 10);
      if (lvl === 0) {
        this.isBottomLayer[name] = true;
      } else if (lvl === 1) {
        this.isMiddleLayer[name] = true;
      } else if (lvl === 2) {
        this.isTopLayer[name] = true;
      }
    }

    const data = layers[i].data;
    const data1D = data['#text'].split(',').map(x => parseInt(x, 10));

    let row = [];
    const rows = [];

    let idx = 0;
    while (idx < data1D.length) {
      if (row.length === width) {
        rows.push(row);
        row = [];
      }
      row.push(data1D[idx]);
      idx += 1;
    }

    if (row.length !== 0) {
      rows.push(row);
      row = [];
    }

    data2Ds.push(rows);
  }

  this.map = map;
  this.tilesets = tilesets;
  this.data2Ds = data2Ds;
  this._spatialID = spatialManager.getNewSpatialID();
}

TiledMap.prototype._getLayerName = function (layer) {
  return layer['@attributes'].name;
};

TiledMap.prototype._render = function (ctx, data2D, textureAtlas) {

};

TiledMap.prototype._renderIndexTile = function (ctx, index, x, y, w, h, cfg) {
  // BLANK?
  if (index === 0) {
    return;
  }

  // TODO: this -1 is bound to Tiled app
  let sidx = 0;
  let sgid = -1;

  const map = this.map;

  for (let z = 0; z < map.tileset.length; z += 1) {
    const gid = parseInt(map.tileset[z]['@attributes'].firstgid, 10);
    if (gid > index) {
      z = map.tileset.length;
    } else {
      sidx = z;
      sgid = gid;
    }
  }

  if (index - sgid < 0) {
    throw Error();
  }

  const tidx = index - sgid;

  const textureAtlas = this.tilesets[sidx].textureAtlas;
  const tlut = this.tilesets[sidx].tlut;

  if (cfg && cfg.occlusion) {
    const pkg = tlut[tidx];

    if (pkg) {
      /*
            const oldFillStyle = ctx.fillStyle;
            ctx.fillStyle = "#000";
            ctx.fillRect(x, y, w, h);
            ctx.fill();
            ctx.fillStyle = oldFillStyle;
            */

      textureAtlas.renderIndexTile(ctx, tidx, x, y, w, h);
    }
  } else {
    textureAtlas.renderIndexTile(ctx, tidx, x, y, w, h);
  }
};

TiledMap.prototype._render = function (ctx, index, cfg) {
  const wx1 = g_viewport.getOX();
  const wy1 = g_viewport.getOY();

  const wx2 = g_viewport.getOX() + g_viewport.getOW();
  const wy2 = g_viewport.getOY() + g_viewport.getOH();


  const tileWidth = this.tileWidth;
  const tileHeight = this.tileHeight;

  const tx1 = Math.floor(wx1 / tileWidth);
  const ty1 = Math.floor(wy1 / tileHeight);

  const tx2 = Math.floor(wx2 / tileWidth);
  const ty2 = Math.floor(wy2 / tileHeight);

  // offset
  const offx = Math.round(util.posmod(wx1, tileWidth));
  const offy = Math.round(util.posmod(wy1, tileHeight));

  const map = this.map;

  // LAYERS
  const layers = Array.isArray(map.layer) ? map.layer : [map.layer];
  const data2D = this.data2Ds[index];

  for (let ty = ty1, i = 0; ty <= ty2; ty += 1, i += 1) {
    for (let tx = tx1, j = 0; tx <= tx2; tx += 1, j += 1) {
      if (ty >= 0 && ty < this.heightInTiles && tx >= 0 && tx < this.widthInTiles) {
        const x = -offx + j * tileWidth;
        const y = -offy + i * tileHeight;
        const w = tileWidth;
        const h = tileHeight;

        const index = data2D[ty][tx];

        this._renderIndexTile(ctx, index, x, y, w, h, cfg);
      }
    }
  }
};

TiledMap.prototype.renderBottom = function (ctx, cfg) {
  const layers = this.layers;
  for (let i = 0; i < layers.length; i += 1) {
    const layer = layers[i];
    const name = this._getLayerName(layer);
    if (this.isBottomLayer[name]) {
      this._render(ctx, i, cfg);
    }
  }
};

TiledMap.prototype.renderMiddle = function (ctx, cfg) {
  const layers = this.layers;
  for (let i = 0; i < layers.length; i += 1) {
    const layer = layers[i];
    const name = this._getLayerName(layer);
    if (this.isMiddleLayer[name]) {
      this._render(ctx, i, cfg);
    }
  }
};

TiledMap.prototype.renderTop = function (ctx, cfg) {
  const layers = this.layers;
  for (let i = 0; i < layers.length; i += 1) {
    const layer = layers[i];
    const name = this._getLayerName(layer);
    if (this.isTopLayer[name]) {
      this._render(ctx, i, cfg);
    }
  }
};

TiledMap.prototype.render = function (ctx, cfg) {
  this.renderBottom(ctx, cfg);
  this.renderMiddle(ctx, cfg);
  this.renderTop(ctx, cfg);
};

// Ideally, only run this once.
// Only run this once!
TiledMap.prototype.addObstructions = function () {
  const map = this.map;
  const layers = Array.isArray(map.layer) ? map.layer : [map.layer];


  const tts = spatialManager.getTileSize();


  // World width
  const ww = this.widthInTiles * this.tileWidth;
  const wh = this.heightInTiles * this.tileHeight;

  const tmw = this.tileWidth;
  const tmh = this.tileHeight;

  const smw = spatialManager.getTileSize();
  const smh = spatialManager.getTileSize();

  // Go through every pixel D:'!!

  /*

  for (let layerIdx = 0; layerIdx < layers.length; layerIdx += 1) {
    // Use 2D lookup table associated with this layer.
    const data2D = this.data2Ds[layerIdx];

    // Iterate through rows
    for (let wy = 0; wy < wh; wy += 1) {
      for (let wx = 0; wx < ww; wx += 1) {

        // TILED MAP
        const tx = Math.floor(wx / tmw);
        const ty = Math.floor(wy / tmh);

        const txr = wx - tmw * tx;
        const tyr = wy - tmh * ty;

        // SPATIAL MANAGER
        const sx = Math.floor(wx / smw);
        const sy = Math.floor(wy / smh);


        // Global index
        const gidx = data2D[ty][tx];

        // If gidx === 0 then it's empty
        if (gidx !== 0) {
          // Selection
          let sidx = -1;
          let sgid = -1;

          for (let tileSetIdx = 0; tileSetIdx < map.tileset.length; tileSetIdx++) {
            const gid = parseInt(map.tileset[tileSetIdx]["@attributes"].firstgid, 10);
            if (gid > gidx) {
              // end for loop
              tileSetIdx = map.tileset.length;
            } else {
              sidx = tileSetIdx;
              sgid = gid;
            }
          }

          if (gidx - sgid < 0) {
            throw Error();
          }

          const tileset = this.tilesets[sidx];
          const tlut = tileset.tlut;
          const ta = tileset.textureAtlas;

          const tidx = gidx - sgid;

          // Super slow
          let count = 0;
          let total = tmw * tmh;
          for (let i = 0; i < tmh; i += 1) {
            for (let j = 0; j < tmw; j += 1) {
              const sample = ta.sample(tx, ty, j, i);
              if (sample.a !== 0) count++;
            }
          }

          const percentage = count / total;


          if (tlut[tidx] && percentage > 0.25) {
            if (tlut[tidx].name === 'collision' && tlut[tidx].value) {
              spatialManager.debug._registerTile(spatialManager.debug.WALL_ID, sx, sy);
            }
          }
        }

      }
    }
  }
  */

  console.log('TRUE');

  // if (true) return;

  // Spatial manager
  const spRows = Math.ceil(ww / tts); // rows
  const spCols = Math.ceil(wh / tts); // columns

  const ITER = 0;

  /*
  // Iterate through layers.
  for (let layerIdx = 0; layerIdx < layers.length; layerIdx += 1) {

    // Use 2D lookup table associated with this layer.
    const data2D = this.data2Ds[layerIdx];

    // Iterate through rows
    for (let smRowIdx = 0; smRowIdx < spRows; smRowIdx += 1) {
      // Iterate through columns
      for (let smColIdx = 0; smColIdx < spCols; smColIdx += 1) {

        const qx = smColIdx * tts / this.tileWidth;
        const qy = smRowIdx * tts / this.tileHeight;

        // Compute coord. from spatial manager to data2D
        // integer p
        // How man tiles
        const tx = Math.floor(qx);
        const ty = Math.floor(qy);

        // Fractional part
        const fx = qx % 1;
        const fy = qy % 1;

       const index = data2D[ty][tx];

        if (index !== 0) {
          let sidx = -1;
          let sgid = -1;

          for (let tileSetIdx = 0; tileSetIdx < map.tileset.length; tileSetIdx++) {
            const gid = parseInt(map.tileset[tileSetIdx]["@attributes"].firstgid, 10);
            if (gid > index) {
              // end for loop
              tileSetIdx = map.tileset.length;
            } else {
              sidx = tileSetIdx;
              sgid = gid;
            }
          }

          if (index - sgid < 0) {
            throw Error();
          }

          const tileset = this.tilesets[sidx];

          const tidx = index - sgid;
          const tlut = tileset.tlut;
          const ta = tileset.textureAtlas;


          const paddingX = 0.25;
          const paddingY = 0.25;

          const perX = paddingX + fx;
          const perY = paddingY + fy;


          const sample = ta.sample(tx, ty, perX, perY);


          //console.log(sample)

          if (tlut[tidx] && sample.a !== 0) {
            if (tlut[tidx].name === 'collision' && tlut[tidx].value) {

              // Sample texture atlas


              spatialManager.debug._registerTile(spatialManager.debug.WALL_ID, smColIdx, smRowIdx);
            }
          }
        }
      }
    }
  } */


  // Iterate through layers

  for (let i = 0; i < layers.length; i += 1) {
    // Iterate through columns
    const data2D = this.data2Ds[i];
    for (let j = 0; j < this.heightInTiles; j += 1) {
      for (let k = 0; k < this.widthInTiles; k += 1) {
        const tx = k;
        const ty = j;

        const index = data2D[ty][tx];

        if (index !== 0) {
          let sidx = 0;
          // let sidx = -1;
          let sgid = -1;

          for (let z = 0; z < map.tileset.length; z += 1) {
            const gid = parseInt(map.tileset[z]['@attributes'].firstgid, 10);
            if (gid > index) {
              z = map.tileset.length;
            } else {
              sidx = z;
              sgid = gid;
            }
          }

          if (index - sgid < 0) {
            throw Error();
          }

          const tidx = index - sgid;

          // console.log(this.tilesets, sidx);

          const tlut = this.tilesets[sidx].tlut;


          if (tlut[tidx]) {
            if (tlut[tidx].name === 'collision' && tlut[tidx].value) {
              spatialManager.debug._registerTile(spatialManager.debug.WALL_ID, tx, ty);
            }
          }
        }
      }
    }
  }
};

/*
TiledMap.prototype.render = function (ctx) {
  // X and Y coordinates of the viewport in
  // world space.
  const wx1 = g_viewport.getOX();
  const wy1 = g_viewport.getOY();

  const wx2 = g_viewport.getOX() + g_viewport.getOW();
  const wy2 = g_viewport.getOY() + g_viewport.getOH();

  // console.log(wx1, wy1, wx2, wy2);

  const cols = this.textureAtlas.cols;
  const rows = this.textureAtlas.rows;

  const tileWidth = this.textureAtlas.tileWidth;
  const tileHeight = this.textureAtlas.tileHeight;

  const tx1 = Math.floor(wx1 / tileWidth);
  const ty1 = Math.floor(wy1 / tileHeight);

  const tx2 = Math.floor(wx2 / tileWidth);
  const ty2 = Math.floor(wy2 / tileHeight);

  // offset
  const offx = Math.round(util.posmod(wx1, tileWidth));
  const offy = Math.round(util.posmod(wy1, tileHeight));

  const m = ty2 - ty1;
  const n = tx2 - tx1;

  for (let ty = ty1, i = 0; ty <= ty2; ty += 1, i += 1) {
    for (let tx = tx1, j = 0; tx <= tx2; tx += 1, j += 1) {
      if (ty >= 0 && ty < this.data2D.length && tx >= 0 && tx < this.data2D[ty].length) {
        const x = -offx + j * tileWidth;
        const y = -offy + i * tileHeight;
        const w = tileWidth;
        const h = tileHeight;

        // TODO: this -1 is bound to Tiled app
        const index = this.data2D[ty][tx] - 1;
        this.textureAtlas.renderIndexTile(ctx, index, x, y, w, h);
      }
    }
  }
};
*/
