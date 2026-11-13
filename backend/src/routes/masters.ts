import { Router } from "express";
import { prisma } from "../db.js";

export const mastersRouter = Router();

/** Product and area masters for the public registration form (F-04, F-05). */
mastersRouter.get("/", async (_req, res) => {
  const [products, states] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: { code: true, name: true },
    }),
    prisma.state.findMany({
      orderBy: { name: "asc" },
      select: {
        code: true,
        name: true,
        cities: { where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } },
      },
    }),
  ]);

  res.set("Cache-Control", "public, max-age=300");
  res.json({ products, states: states.filter((s) => s.cities.length > 0) });
});
