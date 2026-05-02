import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // ローカル開発用ユーザー (apps/api/.env の DEV_USER_ID と一致させる)
  const devUser = await prisma.user.upsert({
    where: { id: "dev-user-local-001" },
    create: { id: "dev-user-local-001", displayName: "Dev User", username: "dev" },
    update: {},
  })

  console.log(`Dev user: ${devUser.id}`)

  // テストコース
  const courses = [
    {
      name: "代々木公園ランニングコース",
      description: "公園内の整備された周回コース。初心者にも走りやすいフラットな道。",
      distanceM: 3500,
      difficulty: "easy" as const,
      tags: ["公園", "フラット", "初心者向け"],
      startLat: 35.6714,
      startLng: 139.6943,
    },
    {
      name: "皇居外苑一周",
      description: "ランナーの聖地。皇居を一周する定番コース。歩道が広く安全。",
      distanceM: 5000,
      difficulty: "moderate" as const,
      tags: ["皇居", "定番", "信号なし"],
      startLat: 35.6851,
      startLng: 139.7526,
    },
    {
      name: "多摩川河川敷10km",
      description: "多摩川沿いの気持ちいい直線コース。景色が良く長距離向き。",
      distanceM: 10000,
      difficulty: "hard" as const,
      tags: ["河川敷", "長距離", "景色"],
      startLat: 35.5714,
      startLng: 139.6501,
    },
  ]

  for (const course of courses) {
    await prisma.course.upsert({
      where: {
        id: `seed-${course.name}`,
      },
      create: {
        id: `seed-${course.name}`,
        ...course,
        createdById: devUser.id,
      },
      update: {},
    })
  }

  console.log(`Seeded ${courses.length} courses`)
}

main()
  .then(() => console.log("✅ Seed complete"))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
