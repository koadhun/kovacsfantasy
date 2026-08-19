// Ideiglenes teszt-kapcsoló: ha a TEST_GAME_TYPE env-változó "PRE"-re van
// állítva, a rendszer az előszezon meccseit kezeli "aktívnak" a Standings,
// Stats, Weekly Pick'Em és Perfect Challenge szempontjából, hogy élőben
// tesztelhető legyen a teljes pipeline a valódi alapszakasz-kezdés előtt.
//
// Teszteléskor: .env / Render Environment -> TEST_GAME_TYPE=PRE
// Visszaállításkor: töröld ezt az env-változót (vagy állítsd REG-re).

export const ACTIVE_GAME_TYPE = process.env.TEST_GAME_TYPE === "PRE" ? "PRE" : "REG";

export const ACTIVE_STAGE_NAME =
  ACTIVE_GAME_TYPE === "PRE" ? "Pre Season" : "Regular Season";