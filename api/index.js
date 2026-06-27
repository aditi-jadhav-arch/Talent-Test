let appPromise = null;

export default async function handler(req, res) {
  if (!appPromise) {
    appPromise = import("../artifacts/api-server/dist/app.mjs").then(m => m.default);
  }
  const app = await appPromise;
  return app(req, res);
}
