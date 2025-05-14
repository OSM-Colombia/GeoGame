import { osmAuth, User as OsmUser } from 'osm-auth';

// Configuración de osm-auth (reemplaza con tus credenciales de OSM)
const osmAuthConfig = {
  oauth_consumer_key: 'tu_consumer_key',
  oauth_secret: 'tu_consumer_secret',
  oauth_url: 'https://www.openstreetmap.org/oauth',
  auto: true, // (opcional) auto login si ya se autorizó
};

// Instancia de osmAuth (se crea una única vez)
const auth = (osmAuth as any)(osmAuthConfig);

// Función para iniciar sesión (login) en OSM. Retorna una promesa que se resuelve con el objeto de usuario (o se rechaza con un error).
export async function login(): Promise<OsmUser> {
  return new Promise((resolve, reject) => {
    if (auth.authenticated()) {
      resolve(auth.user());
    } else {
      auth.authenticate((err: Error, user: OsmUser) => {
        if (err) {
          reject(err);
        } else {
          resolve(user);
        }
      });
    }
  });
}

// Guarda score, time y date en claves separadas según el SRS
export async function saveBestScore(catId: string, score: number, time: number, date: string): Promise<Response[]> {
  if (!auth.authenticated()) {
    throw new Error("Usuario no autenticado en OSM.");
  }
  const prefix = "geogame-" + catId + "-";
  const promises = [
    fetch("https://www.openstreetmap.org/api/0.6/user/preferences/" + prefix + "score", { method: "PUT", headers: { "Content-Type": "text/plain" }, body: score.toString(), credentials: "include" }),
    fetch("https://www.openstreetmap.org/api/0.6/user/preferences/" + prefix + "time", { method: "PUT", headers: { "Content-Type": "text/plain" }, body: time.toString(), credentials: "include" }),
    fetch("https://www.openstreetmap.org/api/0.6/user/preferences/" + prefix + "date", { method: "PUT", headers: { "Content-Type": "text/plain" }, body: date, credentials: "include" })
  ];
  const resp = await Promise.all(promises);
  if (resp.some(r => !r.ok)) {
    throw new Error("Error al guardar la preferencia en OSM.");
  }
  return resp;
}

// Obtiene los mejores puntajes, tiempos y fechas de cada categoría desde OSM
export async function getBestScores(catIds: string[]): Promise<Record<string, { score?: number, time?: number, date?: string }>> {
  if (!auth.authenticated()) {
    throw new Error("Usuario no autenticado en OSM.");
  }
  const url = "https://www.openstreetmap.org/api/0.6/user/preferences";
  const resp = await fetch(url, { credentials: "include" });
  if (!resp.ok) throw new Error("No se pudieron obtener las preferencias de OSM");
  const xml = await resp.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "application/xml");
  const prefs: Record<string, { score?: number, time?: number, date?: string }> = {};
  for (const catId of catIds) {
    const scoreNode = doc.querySelector(`preference[key="geogame-${catId}-score"]`);
    const timeNode = doc.querySelector(`preference[key="geogame-${catId}-time"]`);
    const dateNode = doc.querySelector(`preference[key="geogame-${catId}-date"]`);
    prefs[catId] = {
      score: scoreNode ? Number(scoreNode.getAttribute("value")) : undefined,
      time: timeNode ? Number(timeNode.getAttribute("value")) : undefined,
      date: dateNode ? dateNode.getAttribute("value") || undefined : undefined,
    };
  }
  return prefs;
} 