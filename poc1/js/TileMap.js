

function TileMap(cfg) {

    const type = cfg.type;

    this.textureAtlas = cfg.textureAtlas;

    if (type === 1) {
         
        const map = util.xml2json(cfg.map).map;
        const tileset = util.xml2json(cfg.tileset).tileset;
      
        g_map = map;
        g_tileset = tileset;
      
        // Width in tiles
        const width = parseInt(map['@attributes'].width);
        const height = parseInt(map['@attributes'].height);
      
        // Width in pixels
        const tileWidth = parseInt(map['@attributes'].tilewidth);
        const tileHeight = parseInt(map['@attributes'].tileheight);
      
        const data1D = map.layer.data["#text"].split(',').map(x => parseInt(x));
      
      
        let row = [];
        let rows = [];
      
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
        
        const data2D = rows;

        this.data2D = data2D;
    }
}

TileMap.prototype.render = function (ctx) {

    // X and Y coordinates of the viewport in
    // world space.
    const wx1 = g_viewport.getOX();
    const wy1 = g_viewport.getOY();

    const wx2 = g_viewport.getOX() + g_viewport.getOW();
    const wy2 = g_viewport.getOY() + g_viewport.getOH();

    //console.log(wx1, wy1, wx2, wy2);

    const cols = this.textureAtlas.cols;
    const rows = this.textureAtlas.rows;
    
    const tileWidth = this.textureAtlas.tileWidth;
    const tileHeight = this.textureAtlas.tileHeight;

    const tx1 = Math.floor(wx1 / tileWidth);
    const ty1 = Math.floor(wy1 / tileHeight);

    const tx2 = Math.floor(wx2 / tileWidth);
    const ty2 = Math.floor(wy2 / tileHeight);

    // offset
    const offx = wx1 % tileWidth;
    const offy = wy1 % tileHeight;

    // TODO need to fix snapping

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


    //this.textureAtlas(ctx, index, x, y, w, h);

};