import { Link } from "react-router-dom";

function Section({ title, children }) {
  return (
    <div className="card" style={{ padding: 20, marginBottom: 14 }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {children}
    </div>
  );
}

export default function PlayoffChallengeRules() {
  return (
    <div className="container page">
      <div className="hero">
        <div className="kicker">
          <span className="tag">RULES</span>
          <span>Playoff Challenge</span>
        </div>
        <h1 className="h1">Playoff Challenge - Szabályok</h1>
        <p className="sub">
          A rájátszás négy körén át tartsd meg ugyanazt a játékost - minél tovább, annál nagyobb
          szorzóval számolnak a pontjai.
        </p>
      </div>

      <div style={{ marginTop: 18 }}>
        <Section title="A körök">
          <p>A Playoff Challenge négy egymást követő körből áll:</p>
          <ul>
            <li><strong>Wildcard</strong></li>
            <li><strong>Divisional</strong></li>
            <li><strong>Conference</strong></li>
            <li><strong>Super Bowl</strong></li>
          </ul>
          <p>
            Minden körben ugyanazt a 8 pozíciós rostert (QB, RB1, RB2, WR1, WR2, TE, K, DEF) kell
            összeállítanod, mint a Perfect Challenge-ben.
          </p>
        </Section>

        <Section title="A lánc-szorzó (multiplier)">
          <p>
            Ha egy adott slotra (pl. QB) <strong>ugyanazt a játékost</strong> választod ki
            egymást követő körökben is, a pontszáma egyre nagyobb szorzót kap:
          </p>
          <ul>
            <li>1. kör, amikor kiválasztod: <strong>x1</strong> szorzó</li>
            <li>2. egymást követő kör ugyanazzal a játékossal: <strong>x2</strong> szorzó</li>
            <li>3. egymást követő kör ugyanazzal a játékossal: <strong>x3</strong> szorzó</li>
            <li>4. egymást követő kör ugyanazzal a játékossal: <strong>x4</strong> szorzó</li>
          </ul>
          <p>
            Ha egy körben <strong>másik</strong> játékost választasz ugyanarra a pozícióra, a
            lánc megszakad, és a szorzó <strong>visszaáll x1-re</strong> - onnantól újra kell
            építeni a sorozatot.
          </p>
        </Section>

        <Section title="Pontozás">
          <p>
            Az alap pontszámítás megegyezik a Perfect Challenge-ben használt képletekkel
            (yardagenkénti, TD-nkénti pontok pozíciónként, K távolság-sávos field goal pontok, DEF
            takeaway és kapott pont alapú pontozás). A végleges pontszám ez, megszorozva az adott
            slot aktuális lánc-szorzójával.
          </p>
        </Section>

        <Section title="Zárolás">
          <p>
            Egy játékos csak addig választható/cserélhető, amíg a csapatának adott köri mérkőzése
            el nem kezdődött. Utána a pozíció zárolódik az adott körre.
          </p>
        </Section>
      </div>

      <Link to="/fantasy/playoff-challenge" className="btn" style={{ marginTop: 4 }}>
        ← Vissza a Playoff Challenge-hez
      </Link>
    </div>
  );
}