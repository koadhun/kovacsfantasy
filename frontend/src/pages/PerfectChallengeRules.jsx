import { Link } from "react-router-dom";

function Section({ title, children }) {
  return (
    <div className="card" style={{ padding: 20, marginBottom: 14 }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {children}
    </div>
  );
}

export default function PerfectChallengeRules() {
  return (
    <div className="container page">
      <div className="hero">
        <div className="kicker">
          <span className="tag">RULES</span>
          <span>Perfect Challenge</span>
        </div>
        <h1 className="h1">Perfect Challenge - Szabályok</h1>
        <p className="sub">
          Állíts össze egy 8 fős heti rostert, és gyűjts pontokat a játékosaid valós NFL
          teljesítménye alapján.
        </p>
      </div>

      <div style={{ marginTop: 18 }}>
        <Section title="A roster felépítése">
          <p>Minden héten 8 pozíciót kell feltöltened:</p>
          <ul>
            <li><strong>QB</strong> - Irányító</li>
            <li><strong>RB1, RB2</strong> - Futójátékosok</li>
            <li><strong>WR1, WR2</strong> - Elkapók</li>
            <li><strong>TE</strong> - Tight End</li>
            <li><strong>K</strong> - Rúgó</li>
            <li><strong>DEF</strong> - Csapatvédelem</li>
          </ul>
          <p>
            Egy játékos <strong>csak addig választható</strong>, amíg a csapatának mérkőzése el
            nem kezdődött. Miután egy játékos mérkőzése elindult, a pozíció{" "}
            <strong>zárolódik</strong> - onnantól nem cserélhető.
          </p>
        </Section>

        <Section title="Pontozás - QB">
          <ul>
            <li>Passzyard: <strong>1 pont / 25 yard</strong></li>
            <li>Passz TD: <strong>+4 pont</strong></li>
            <li>Interception: <strong>-2 pont</strong></li>
            <li>Futott yard: <strong>1 pont / 10 yard</strong></li>
            <li>Futott TD: <strong>+6 pont</strong></li>
            <li>Elejtett labda (fumble): <strong>-2 pont</strong></li>
          </ul>
        </Section>

        <Section title="Pontozás - RB">
          <ul>
            <li>Futott yard: <strong>1 pont / 10 yard</strong></li>
            <li>Futott TD: <strong>+6 pont</strong></li>
            <li>Elkapott yard: <strong>1 pont / 10 yard</strong></li>
            <li>Elkapott TD: <strong>+6 pont</strong></li>
            <li>Elejtett labda: <strong>-2 pont</strong></li>
          </ul>
        </Section>

        <Section title="Pontozás - WR / TE">
          <ul>
            <li>Elkapott yard: <strong>1 pont / 10 yard</strong></li>
            <li>Elkapott TD: <strong>+6 pont</strong></li>
            <li>Futott yard: <strong>1 pont / 10 yard</strong></li>
            <li>Futott TD: <strong>+6 pont</strong></li>
            <li>Elejtett labda: <strong>-2 pont</strong></li>
          </ul>
        </Section>

        <Section title="Pontozás - K (Rúgó)">
          <ul>
            <li>Sikeres field goal 0-49 yardról: <strong>+3 pont</strong></li>
            <li>Sikeres field goal 50+ yardról: <strong>+5 pont</strong></li>
            <li>Sikeres extra point: <strong>+1 pont</strong></li>
          </ul>
        </Section>

        <Section title="Pontozás - DEF (Csapatvédelem)">
          <ul>
            <li>Alap pontszám: <strong>10 pont</strong></li>
            <li>Interception: <strong>+2 pont / db</strong></li>
            <li>Kicsikart labda (forced fumble): <strong>+2 pont / db</strong></li>
            <li>Sack: <strong>+1 pont / db</strong></li>
            <li>Safety: <strong>+2 pont / db</strong></li>
            <li>Visszafutott TD: <strong>+6 pont / db</strong></li>
            <li>
              Kapott pontok büntetése:
              <ul>
                <li>1-6 kapott pont: <strong>-3 pont</strong></li>
                <li>7-13 kapott pont: <strong>-6 pont</strong></li>
                <li>14-20 kapott pont: <strong>-9 pont</strong></li>
                <li>21-27 kapott pont: <strong>-10 pont</strong></li>
                <li>28-34 kapott pont: <strong>-11 pont</strong></li>
                <li>35+ kapott pont: <strong>-14 pont</strong></li>
                <li>0 kapott pont (shutout): nincs büntetés</li>
              </ul>
            </li>
          </ul>
        </Section>

        <Section title="Élő frissítés">
          <p>
            A kártyákon látható <strong>LIVE / FINAL / SCHEDULED</strong> jelzés a kiválasztott
            játékos mérkőzésének állapotát mutatja. Amíg a mérkőzés nem kezdődött el, minden
            statisztika 0. Élő mérkőzés közben a statok és a pontszám rendszeresen frissülnek.
          </p>
        </Section>
      </div>

      <Link to="/fantasy/perfect-challenge" className="btn" style={{ marginTop: 4 }}>
        ← Vissza a Perfect Challenge-hez
      </Link>
    </div>
  );
}