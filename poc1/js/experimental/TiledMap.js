

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

  for (let i = 0; i < layers.length; i += 1) {
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

  console.log(this);
}

TiledMap.prototype._render = function (ctx, data2D, textureAtlas) {

};

TiledMap.prototype._renderIndexTile = function (ctx, index, x, y, w, h, cfg) {

  

  // BLANK?
  if (index === 0) {
    return;
  }

  // TODO: this -1 is bound to Tiled app
  let sidx = -1;
  let sgid = -1;

  const map = this.map;
  
  for (let z = 0; z < map.tileset.length; z++) {
    const gid = parseInt(map.tileset[z]["@attributes"].firstgid, 10);
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
  this._render(ctx, 0, cfg);
};

TiledMap.prototype.renderMiddle = function (ctx, cfg) {
  this._render(ctx, 1, cfg);

};

TiledMap.prototype.renderTop = function (ctx, cfg) {
  this._render(ctx, 2, cfg);

};

TiledMap.prototype.render = function (ctx, cfg) {
  this.renderBottom(ctx, cfg);
  this.renderMiddle(ctx, cfg);
  this.renderTop(ctx, cfg);
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