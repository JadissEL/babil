const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const dataPath = path.join(__dirname, '../data/countries.json');
  const rawData = fs.readFileSync(dataPath, 'utf8');
  const { countries } = JSON.parse(rawData);

  console.log(`Starting seeding for ${countries.length} countries...`);

  for (const c of countries) {
    const countryData = {
      name: c.country,
      region: c.region,
      schengen_flag: c.schengen_flag || c.region === 'Schengen',
      tourist_visa_score: parseFloat(c.official_score) || 0,
      study_visa_score: c.education_mobility?.technical_training?.access_bac ? 8.0 : 5.0,
      work_visa_score: c.visa_system?.work ? 7.0 : 4.0,
      business_visa_score: c.visa_system?.business ? 7.5 : 4.5,
      appointment_difficulty: c.appointment_difficulty || c.friction_analysis?.risk_level || 'Medium',
      visa_processing_time: c.friction_analysis?.real_delay || 'Unknown',
      rejection_risk: c.friction_analysis?.risk_level || 'Medium',
      language_study_access: c.education_mobility?.language_study?.access || 'Unknown',
      technical_training_access: c.education_mobility?.technical_training?.access_bac ? 'Available' : 'Limited',
      short_course_access: c.education_mobility?.short_courses?.duration || 'Unknown',
      street_food_business_access: c.street_food?.opportunity || 'Unknown',
      driving_license_status: c.driving_license?.status || 'Unknown',
      full_data: JSON.stringify(c)
    };

    await prisma.country.upsert({
      where: { name: c.country },
      update: countryData,
      create: countryData,
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
