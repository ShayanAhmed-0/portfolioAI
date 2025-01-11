-- CreateTable
CREATE TABLE "auth" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "is_profile_completed" BOOLEAN NOT NULL DEFAULT false,
    "salt" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "auth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profile" (
    "id" TEXT NOT NULL,
    "auth_id" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "longitude" DOUBLE PRECISION,
    "latitude" DOUBLE PRECISION,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "allowNotifications" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" TEXT NOT NULL,
    "user_profile_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "user_profile_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "user_profile_id" TEXT,
    "review" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "deviceType" TEXT NOT NULL,
    "deviceToken" TEXT NOT NULL,
    "isLoggedIn" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "user_profile_id" TEXT,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "user_profile_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MediaToReviews" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "auth_email_key" ON "auth"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_profile_auth_id_key" ON "user_profile"("auth_id");

-- CreateIndex
CREATE UNIQUE INDEX "skills_user_profile_id_key" ON "skills"("user_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "media_user_profile_id_key" ON "media"("user_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_user_profile_id_key" ON "reviews"("user_profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "_MediaToReviews_AB_unique" ON "_MediaToReviews"("A", "B");

-- CreateIndex
CREATE INDEX "_MediaToReviews_B_index" ON "_MediaToReviews"("B");

-- AddForeignKey
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_auth_id_fkey" FOREIGN KEY ("auth_id") REFERENCES "auth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "user_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "user_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "user_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "user_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "user_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MediaToReviews" ADD CONSTRAINT "_MediaToReviews_A_fkey" FOREIGN KEY ("A") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MediaToReviews" ADD CONSTRAINT "_MediaToReviews_B_fkey" FOREIGN KEY ("B") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
