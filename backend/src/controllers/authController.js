import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { sendWelcomeEmail } from "../services/mailer.js";

export async function register(req, res) {
  const { username, email, password, confirmPassword } = req.body;

  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: "Minden mező kötelező." });
  }

  if (password !== confirmPassword) {
    return res
      .status(400)
      .json({ error: "A megadott jelszó és jelszó megerősitése nem egyezik." });
  }

const existingUser = await prisma.user.findFirst({
    where: { username: { equals: username, mode: "insensitive" } }
  });
  if (existingUser) {
    return res.status(400).json({ error: "A megadott felhasználónév már foglalt." });
  }

  // Belépéskor a felhasználónév és az email cím is használható, ezért a kettő nem
  // ütközhet: a felhasználónév nem lehet más felhasználó email címe.
  const usernameIsSomeonesEmail = await prisma.user.findFirst({
    where: { email: { equals: username, mode: "insensitive" } }
  });
  if (usernameIsSomeonesEmail) {
    return res.status(400).json({ error: "A megadott felhasználónév már foglalt." });
  }

  const existingEmail = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } }
  });
  if (existingEmail) {
    return res.status(400).json({ error: "A megadott email cim már használatban van." });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { username, email, passwordHash }
  });

  // Email küldés (ha be van állítva az EMAIL_USER/PASS)
 // Email küldés (ha be van állítva az EMAIL_USER/PASS) - hiba esetén nem akasztjuk meg a regisztrációt
try {
  await sendWelcomeEmail({ to: email, username });
} catch (err) {
  console.error("Nem sikerült az üdvözlő emailt elküldeni:", err.message);
}

  return res.json({ message: "Sikeres regisztráció", userId: user.id });
}

export async function login(req, res) {
  const body = req.body || {};

  // Felhasználónév VAGY email cím. A régi kliensek "username" mezőt küldenek, ezt is elfogadjuk.
  const identifier = String(body.identifier ?? body.username ?? body.email ?? "").trim();
  const { password } = body;

  if (!identifier || typeof password !== "string" || !password) {
    return res
      .status(400)
      .json({ error: "Felhasználónév vagy email cím és jelszó kötelező." });
  }

  const candidates = await prisma.user.findMany({
    where: {
      OR: [
        { username: { equals: identifier, mode: "insensitive" } },
        { email: { equals: identifier, mode: "insensitive" } }
      ]
    },
    take: 5
  });

  // Ha a megadott érték email cimnek látszik ("@" van benne), az email-egyezés az első,
  // különben a felhasználónév-egyezés. Mindegyik jelöltnél ellenőrizzük a jelszót, így
  // egy esetleges névütközés sem zárhat ki senkit a belépésből.
  const lowered = identifier.toLowerCase();
  const looksLikeEmail = identifier.includes("@");
  const rank = (u) => {
    const emailMatch = String(u.email).toLowerCase() === lowered;
    const nameMatch = String(u.username).toLowerCase() === lowered;
    if (looksLikeEmail) return emailMatch ? 0 : nameMatch ? 1 : 2;
    return nameMatch ? 0 : emailMatch ? 1 : 2;
  };
  candidates.sort((a, b) => rank(a) - rank(b));

  let user = null;
  for (const candidate of candidates) {
    if (await bcrypt.compare(password, candidate.passwordHash)) {
      user = candidate;
      break;
    }
  }

  if (!user) {
    return res
      .status(400)
      .json({ error: "Megadott felhasználónév / email cím vagy jelszó hibás!" });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return res.json({
    token,
    user: { id: user.id, username: user.username, email: user.email, role: user.role }
  });
}
