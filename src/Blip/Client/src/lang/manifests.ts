export const manifests = [
  {
    type: "localization",
    alias: "Blip.Localization.En",
    weight: -100,
    name: "Blip Localization - English",
    meta: {
      culture: "en",
    },
    js: () => import("./en.js"),
  },
];
