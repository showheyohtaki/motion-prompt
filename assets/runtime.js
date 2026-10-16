// Motion Prompt runtime: a tiny registry. Each pack file calls MotionPrompt.pack(id, factory).
// The factory returns { width, height, cycle, cells, fonts? } where
//   cells[i](ctx, width, height, u)  draws element i at time u (seconds, 0 <= u < cycle).
// Every cell is a pure function of u, so the same code plays in a browser and renders frame by frame.
(function (g) {
  const packs = {}, factories = {};
  let language = 'ja';
  g.MotionPrompt = {
    packs,
    setLanguage(lang) {
      if (language === lang) return;
      language = lang;
      for (const [id, factory] of Object.entries(factories)) this.pack(id, factory);
    },
    pack(id, factory) {
      const p = factory(language);
      factories[id] = factory;
      p.id = id;
      packs[id] = p;
      return p;
    },
    // Load the web fonts a pack declares (fonts: [{ family, url }]) before drawing.
    async loadFonts(p, base) {
      for (const f of p.fonts || []) {
        const face = new FontFace(f.family, `url(${new URL(f.url, base || document.baseURI)})`);
        document.fonts.add(await face.load());
      }
    },
  };
})(window);
