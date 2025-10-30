import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const searchTracksOnSpotify = async (query) => {
  const filePath = path.join(__dirname, "../data/falseSpotifySearchResults.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw);


  return data.tracks;
};