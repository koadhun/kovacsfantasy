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

  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser) {
    return res.status(400).json({ error: "A megadott felhasználónév már foglalt." });
  }

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    return res.status(400).json({ error: "A megadott email cim már használatban van." });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { username, email, passwordHash }
  });

  // Email küldés (ha be van állítva az EMAIL_USER/PASS)
  await sendWelcomeEmail({ to: email, username });

  return res.json({ message: "Sikeres regisztráció", userId: user.id });
}

export async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Felhasználónév és jelszó kötelező." });
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return res.status(400).json({ error: "Megadott felhasználónév vagy jelszó hibás!" });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(400).json({ error: "Megadott felhasználónév vagy jelszó hibás!" });
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