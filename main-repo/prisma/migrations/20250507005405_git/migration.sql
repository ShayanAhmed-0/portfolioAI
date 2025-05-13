-- DropIndex
DROP INDEX "skills_user_profile_id_key";

-- CreateTable
CREATE TABLE "repos" (
    "id" TEXT NOT NULL,
    "user_profile_id" TEXT,
    "name" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "private" BOOLEAN NOT NULL,
    "html_url" TEXT NOT NULL,
    "description" TEXT,
    "fork" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "pushed_at" TIMESTAMP(3) NOT NULL,
    "homepage" TEXT NOT NULL,
    "stargazers_count" INTEGER NOT NULL,
    "watchers_count" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "forks_count" TEXT NOT NULL,
    "visibility" TEXT NOT NULL,
    "forks" INTEGER NOT NULL,
    "open_issues" INTEGER NOT NULL,
    "watchers" INTEGER NOT NULL,
    "default_branch" TEXT NOT NULL,

    CONSTRAINT "repos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "git_user" (
    "id" TEXT NOT NULL,
    "user_profile_id" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "avatar_url" TEXT NOT NULL,
    "html_url" TEXT NOT NULL,
    "email" TEXT,
    "hireable" TEXT,
    "bio" TEXT,
    "public_repos" INTEGER NOT NULL,
    "public_gists" INTEGER NOT NULL,
    "followers" INTEGER NOT NULL,
    "following" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "total_private_repos" INTEGER NOT NULL,
    "owned_private_repos" INTEGER NOT NULL,
    "collaborators" INTEGER NOT NULL,
    "two_factor_authentication" BOOLEAN NOT NULL,

    CONSTRAINT "git_user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "git_user_user_profile_id_key" ON "git_user"("user_profile_id");

-- AddForeignKey
ALTER TABLE "repos" ADD CONSTRAINT "repos_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "user_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "git_user" ADD CONSTRAINT "git_user_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "user_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
