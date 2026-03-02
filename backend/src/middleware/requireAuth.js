import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : header;

    if (!token) return res.status(401).json({ error: "Nincs bejelentkezve." });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch (e) {
    return res.status(401).json({ error: "Érvénytelen token." });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Nincs bejelentkezve." });
  if (req.user.role !== "ADMIN") return res.status(403).json({ error: "Nincs jogosultság." });
  next();
}