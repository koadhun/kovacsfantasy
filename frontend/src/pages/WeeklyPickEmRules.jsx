import { Link } from "react-router-dom";

function Section({ title, children }) {
  return (
    <div className="card" style={{ padding: 20, marginBottom: 14 }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {children}
    </div>
  );
}

export default function WeeklyPickEmRules() {
  return (
    <div className="container page">
      <div className="hero">
        <div className="kicker">
          <span className="tag">RULES</span>
          <span>Weekly Pick'Em</span>
        </div>
        <h1 className="h1">Weekly Pick'Em - Szabályok</h1>
        <p className="sub">
          Minden héten tippeld meg az összes alapszakasz-mérkőzés győztesét, és gyűjts pontokat.
        </p>
      </div>

      <div style={{ marginTop: 18 }}>
        <Section title="Hogyan válassz">
          <p>
            Minden mérkőzésnél válaszd ki, melyik csapat nyer szerinted. A kiválasztott csapatot
            arany keret jelzi. A tippedet <strong>korlátlan alkalommal megváltoztathatod</strong>{" "}
            egészen a mérkőzés kezdetéig (kickoff).
          </p>
          <p>
            Miután egy mérkőzés elkezdődött, a tipped <strong>zárolódik</strong> - onnantól nem
            módosítható.
          </p>
        </Section>

        <Section title="Pontozás">
          <ul>
            <li><strong>10 pont</strong> minden helyes tippért</li>
            <li>
              <strong>+10 bónusz pont</strong>, ha legalább <strong>5 mérkőzést</strong> eltalálsz
              az adott héten
            </li>
            <li>
              <strong>+30 bónusz pont</strong>, ha legalább <strong>10 mérkőzést</strong> eltalálsz
              az adott héten
            </li>
            <li>
              <strong>+50 bónusz pont</strong>, ha a hét <strong>összes</strong> mérkőzését
              eltalálod (tökéletes hét)
            </li>
          </ul>
        </Section>

        <Section title="Leaderboard és láthatóság">
          <p>
            Amíg egy mérkőzés <strong>Open</strong> (nem kezdődött el) állapotban van, más
            játékosok tippjei nem láthatók. Miután egy mérkőzés elkezdődött, a leaderboardon
            keresztül mások tippjei is megtekinthetők <strong>csak azoknál a mérkőzéseknél</strong>,
            amik már elkezdődtek.
          </p>
          <p>
            Egy mérkőzés lezárása (Final) után a csapatok mellett megjelenik a végeredmény, és a
            tipped kerete <strong style={{ color: "#4ade80" }}>zöldre</strong> vált, ha helyesen
            tippeltél, vagy <strong style={{ color: "#f87171" }}>pirosra</strong>, ha nem.
          </p>
        </Section>

        <Section title="Heti és szezon pontszám">
          <p>
            A <strong>Weekly Points</strong> az adott hétre elért pontszámodat mutatja, a{" "}
            <strong>Season Total</strong> pedig az összes eddigi hét pontjainak összegét.
          </p>
        </Section>
      </div>

      <Link to="/fantasy/weekly-pickem" className="btn" style={{ marginTop: 4 }}>
        ← Vissza a Weekly Pick'Em-hez
      </Link>
    </div>
  );
}