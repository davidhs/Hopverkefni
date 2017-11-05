
function TiledTileset(cfg) {
    this.cfg = util.xml2json(cfg.cfg).tileset;
    this.textureAtlas = cfg.textureAtlas;
}