import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Seed categories
  const categories = [
    { name: 'Electronics', slug: 'electronics' },
    { name: 'Fashion', slug: 'fashion' },
    { name: 'Home & Garden', slug: 'home-garden' },
    { name: 'Health & Beauty', slug: 'health-beauty' },
    { name: 'Food & Groceries', slug: 'food-groceries' },
    { name: 'Sports & Outdoors', slug: 'sports-outdoors' },
    { name: 'Books & Stationery', slug: 'books-stationery' },
    { name: 'Automotive', slug: 'automotive' },
    { name: 'Baby & Kids', slug: 'baby-kids' },
    { name: 'Agriculture', slug: 'agriculture' },
    { name: 'Phones & Tablets', slug: 'phones-tablets' },
    { name: 'Computing', slug: 'computing' },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }

  // Seed settings
  const settings = [
    { key: 'site_name', value: 'Dataghmart' },
    { key: 'hero_title', value: 'Ghana\'s Smartest Marketplace' },
    { key: 'hero_subtitle', value: 'Discover amazing products from trusted sellers across Ghana. Smart rankings, real-time tracking, and secure payments.' },
    { key: 'commission_rate', value: '5' },
    { key: 'boost_1day_price', value: '20' },
    { key: 'boost_3days_price', value: '50' },
    { key: 'boost_1month_price', value: '200' },
    { key: 'default_delivery_days', value: '5' },
    { key: 'currency_symbol', value: '₵' },
    { key: 'currency_code', value: 'GHS' },
  ]

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    })
  }

  // Seed announcement
  await prisma.announcement.create({
    data: {
      title: 'Welcome to Dataghmart!',
      body: 'Ghana\'s smartest e-commerce platform is now live. Start shopping or selling today!',
      isActive: true,
    },
  })

  console.log('Seed data created successfully!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
