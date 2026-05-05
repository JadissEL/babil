-- CreateTable
CREATE TABLE "Country" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "schengen_flag" BOOLEAN NOT NULL DEFAULT false,
    "tourist_visa_score" REAL,
    "study_visa_score" REAL,
    "work_visa_score" REAL,
    "business_visa_score" REAL,
    "appointment_difficulty" TEXT,
    "visa_processing_time" TEXT,
    "rejection_risk" TEXT,
    "language_study_access" TEXT,
    "technical_training_access" TEXT,
    "short_course_access" TEXT,
    "street_food_business_access" TEXT,
    "driving_license_status" TEXT,
    "full_data" TEXT
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "countryId" INTEGER NOT NULL,
    CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Comment_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "income" REAL,
    "savings" REAL,
    "CNSS_status" BOOLEAN NOT NULL DEFAULT false,
    "marital_status" TEXT,
    "family_in_europe" BOOLEAN NOT NULL DEFAULT false,
    "goal_type" TEXT,
    CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CountryInsight" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "countryId" INTEGER NOT NULL,
    "osint_insights" TEXT,
    "real_world_friction" TEXT,
    "community_sentiment" TEXT,
    CONSTRAINT "CountryInsight_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Country_name_key" ON "Country"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");
