-- CreateEnum
CREATE TYPE "ProjectAssignmentRole" AS ENUM ('CONTRIBUTOR', 'LEAD');

-- CreateTable
CREATE TABLE "ProjectMember" (
    "id" TEXT NOT NULL,
    "role" "ProjectAssignmentRole" NOT NULL DEFAULT 'CONTRIBUTOR',
    "projectId" TEXT NOT NULL,
    "workspaceMemberId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectMember_workspaceMemberId_idx" ON "ProjectMember"("workspaceMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMember_projectId_workspaceMemberId_key" ON "ProjectMember"("projectId", "workspaceMemberId");

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_workspaceMemberId_fkey" FOREIGN KEY ("workspaceMemberId") REFERENCES "WorkspaceMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
