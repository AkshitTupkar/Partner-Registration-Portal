import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Product master (F-04). Categories confirmed for the first build.
const PRODUCTS = [
  { code: "FANS", name: "Fans", sortOrder: 1 },
  { code: "WATER_PURIFIERS", name: "Water purifiers", sortOrder: 2 },
  { code: "KITCHEN_APPLIANCES", name: "Kitchen appliances", sortOrder: 3 },
  { code: "SMART_LOCKS", name: "Smart locks", sortOrder: 4 },
];

// Area master (F-05): states and union territories with their major cities.
// TODO(OI-02): replace with the real area master once lead qualification is defined.
const AREAS: Record<string, { name: string; cities: string[] }> = {
  AP: { name: "Andhra Pradesh", cities: ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Tirupati"] },
  AR: { name: "Arunachal Pradesh", cities: ["Itanagar"] },
  AS: { name: "Assam", cities: ["Guwahati", "Dibrugarh", "Silchar"] },
  BR: { name: "Bihar", cities: ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur"] },
  CG: { name: "Chhattisgarh", cities: ["Raipur", "Bhilai", "Bilaspur"] },
  GA: { name: "Goa", cities: ["Panaji", "Margao", "Vasco da Gama"] },
  GJ: { name: "Gujarat", cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"] },
  HR: { name: "Haryana", cities: ["Gurugram", "Faridabad", "Panipat", "Ambala"] },
  HP: { name: "Himachal Pradesh", cities: ["Shimla", "Dharamshala", "Mandi"] },
  JH: { name: "Jharkhand", cities: ["Ranchi", "Jamshedpur", "Dhanbad"] },
  KA: { name: "Karnataka", cities: ["Bengaluru", "Mysuru", "Hubballi", "Mangaluru", "Belagavi"] },
  KL: { name: "Kerala", cities: ["Kochi", "Thiruvananthapuram", "Kozhikode", "Thrissur"] },
  MP: { name: "Madhya Pradesh", cities: ["Indore", "Bhopal", "Jabalpur", "Gwalior"] },
  MH: { name: "Maharashtra", cities: ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane", "Aurangabad"] },
  MN: { name: "Manipur", cities: ["Imphal"] },
  ML: { name: "Meghalaya", cities: ["Shillong"] },
  MZ: { name: "Mizoram", cities: ["Aizawl"] },
  NL: { name: "Nagaland", cities: ["Kohima", "Dimapur"] },
  OD: { name: "Odisha", cities: ["Bhubaneswar", "Cuttack", "Rourkela"] },
  PB: { name: "Punjab", cities: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala"] },
  RJ: { name: "Rajasthan", cities: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer"] },
  SK: { name: "Sikkim", cities: ["Gangtok"] },
  TN: { name: "Tamil Nadu", cities: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"] },
  TS: { name: "Telangana", cities: ["Hyderabad", "Warangal", "Karimnagar"] },
  TR: { name: "Tripura", cities: ["Agartala"] },
  UP: { name: "Uttar Pradesh", cities: ["Lucknow", "Kanpur", "Noida", "Ghaziabad", "Agra", "Varanasi"] },
  UK: { name: "Uttarakhand", cities: ["Dehradun", "Haridwar", "Haldwani"] },
  WB: { name: "West Bengal", cities: ["Kolkata", "Howrah", "Siliguri", "Durgapur"] },
  AN: { name: "Andaman and Nicobar Islands", cities: ["Port Blair"] },
  CH: { name: "Chandigarh", cities: ["Chandigarh"] },
  DH: { name: "Dadra and Nagar Haveli and Daman and Diu", cities: ["Daman", "Silvassa"] },
  DL: { name: "Delhi", cities: ["New Delhi", "Dwarka", "Rohini"] },
  JK: { name: "Jammu and Kashmir", cities: ["Srinagar", "Jammu"] },
  LA: { name: "Ladakh", cities: ["Leh"] },
  LD: { name: "Lakshadweep", cities: ["Kavaratti"] },
  PY: { name: "Puducherry", cities: ["Puducherry"] },
};

// Dev-only Blocked Partner Master entry so BR-08 can be tried locally.
const DEV_BLOCKED_MOBILE = "9000000001";

async function main() {
  for (const p of PRODUCTS) {
    await prisma.product.upsert({ where: { code: p.code }, update: p, create: p });
  }

  for (const [code, { name, cities }] of Object.entries(AREAS)) {
    await prisma.state.upsert({ where: { code }, update: { name }, create: { code, name } });
    for (const city of cities) {
      await prisma.city.upsert({
        where: { stateCode_name: { stateCode: code, name: city } },
        update: {},
        create: { name: city, stateCode: code },
      });
    }
  }

  if (process.env.NODE_ENV !== "production") {
    await prisma.blockedPartner.upsert({
      where: { mobile: DEV_BLOCKED_MOBILE },
      update: {},
      create: { mobile: DEV_BLOCKED_MOBILE, reason: "Dev seed: sample blocked partner for testing BR-08" },
    });
  }

  const [products, states, cities] = await Promise.all([
    prisma.product.count(),
    prisma.state.count(),
    prisma.city.count(),
  ]);
  console.log(`Seeded ${products} products, ${states} states, ${cities} cities.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
