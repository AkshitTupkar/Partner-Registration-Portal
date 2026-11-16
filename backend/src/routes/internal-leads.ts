import { Router } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../db.js";
import { HttpError } from "../lib/errors.js";

// Internal read API for the CRM's onboarding screens (atlas-frontend). Mounted only
// when INTERNAL_API_ENABLED is on and Cognito is configured, behind
// requireAtlasStaff (lib/cognito-auth.ts): callers need an Atlas access token in an
// onboarding group. Returns raw Partner Status Master codes (BRD Section
// 12); the CRM owns their labels and step mapping.
// Contract: documentation/onboarding-internal-api.md.

export const internalLeadsRouter = Router();

const listQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  /** Comma-separated ST codes, e.g. "ST-200,ST-201". */
  status: z
    .string()
    .trim()
    .optional()
    .transform((s) => (s ? s.split(",").map((c) => c.trim()).filter(Boolean) : [])),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
});

const leadSelect = {
  id: true,
  referenceNumber: true,
  name: true,
  mobile: true,
  userType: true,
  partnerId: true,
  statusCode: true,
  source: true,
  createdAt: true,
  state: { select: { code: true, name: true } },
  city: { select: { id: true, name: true } },
  products: { select: { product: { select: { code: true, name: true } } } },
  // Latest two events: when the current status was entered, and the status before it
  // (says where a rejection or hold happened, e.g. ST-203 after ST-201 = rejected at
  // ASM screening).
  statusEvents: { orderBy: { createdAt: "desc" }, take: 2, select: { statusCode: true, createdAt: true } },
} satisfies Prisma.LeadSelect;

type LeadRow = Prisma.LeadGetPayload<{ select: typeof leadSelect }>;

function toSummary({ products, statusEvents, ...lead }: LeadRow) {
  return {
    ...lead,
    products: products.map((p) => p.product),
    // Falls back to createdAt for a lead with no history row (should not happen
    // after the backfill migration).
    statusSince: statusEvents[0]?.createdAt ?? lead.createdAt,
    previousStatusCode: statusEvents[1]?.statusCode ?? null,
  };
}

/** GET /api/internal/leads?search=&status=&page=&pageSize= — newest first. */
internalLeadsRouter.get("/", async (req, res) => {
  const q = listQuerySchema.parse(req.query);

  const where: Prisma.LeadWhereInput = {
    ...(q.status.length ? { statusCode: { in: q.status } } : {}),
    ...(q.search
      ? {
          OR: [
            { name: { contains: q.search } },
            { mobile: { contains: q.search } },
            { referenceNumber: { contains: q.search.toUpperCase() } },
          ],
        }
      : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.findMany({
      where,
      select: leadSelect,
      orderBy: { createdAt: "desc" },
      skip: (q.page - 1) * q.pageSize,
      take: q.pageSize,
    }),
  ]);

  res.json({ items: rows.map(toSummary), total, page: q.page, pageSize: q.pageSize });
});

/** GET /api/internal/leads/:id — one lead with its full status history, oldest first. */
internalLeadsRouter.get("/:id", async (req, res) => {
  const lead = await prisma.lead.findUnique({ where: { id: req.params.id }, select: leadSelect });
  if (!lead) throw new HttpError(404, "NOT_FOUND", "Applicant not found.");

  const history = await prisma.leadStatusEvent.findMany({
    where: { leadId: lead.id },
    orderBy: { createdAt: "asc" },
    select: { statusCode: true, actor: true, reason: true, createdAt: true },
  });

  res.json({ ...toSummary(lead), history });
});
