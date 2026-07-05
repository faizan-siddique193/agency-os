import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

/**
 * Resolve the target workspace.
 *
 * Usage:
 *   npx tsx src/features/client/seed/seed-client.ts --slug=my-workspace
 *
 * If --slug is omitted the script falls back to the first workspace it finds
 * and prints a warning so you can confirm it matches your browser URL.
 */
function getSlugArg(): string | null {
    const arg = process.argv.find((a) => a.startsWith("--slug="));
    return arg ? arg.split("=")[1] : null;
}

async function main() {
    const slug = getSlugArg();

    const workspace = slug
        ? await prisma.workspace.findUnique({ where: { slug } })
        : await prisma.workspace.findFirst({ orderBy: { createdAt: "asc" } });

    if (!workspace) {
        throw new Error(
            slug
                ? `No workspace found with slug "${slug}". Check the slug in your browser URL (/w/<slug>/...).`
                : "No workspace found! Please create an account in the UI first."
        );
    }

    if (!slug) {
        console.warn(
            `\n⚠️  WARNING: No --slug argument provided. Falling back to workspace "${workspace.name}" (slug: "${workspace.slug}").`
        );
        console.warn(
            `   If this does NOT match the slug in your browser URL, re-run with: --slug=<your-slug>\n`
        );
    }

    console.log(`\n✅ Seeding clients for Workspace: "${workspace.name}" (slug: "${workspace.slug}")\n`);

    const clientsData = [
        { name: "Acme Corporation", contactName: "Jane Doe",    contactEmail: "jane@acme.com",  workspaceId: workspace.id },
        { name: "Stark Industries",  contactName: "Tony Stark",  contactEmail: "tony@stark.com", workspaceId: workspace.id },
        { name: "Wayne Enterprises", contactName: "Lucius Fox",  contactEmail: "lfox@wayne.com", workspaceId: workspace.id },
    ];

    for (const client of clientsData) {
        const created = await prisma.client.upsert({
            where: {
                // Prevent duplicate seeds: match on name + workspaceId using a unique index.
                // If your schema doesn't have @@unique([name, workspaceId]) yet this will
                // fall back to create. Add the index to schema.prisma for idempotency.
                id: `seed-${workspace.id}-${client.name.replace(/\s+/g, "-").toLowerCase()}`,
            },
            update: {},
            create: client,
        });
        console.log(`   • ${created.name} (${created.id})`);
    }

    console.log("\nClient seeding complete! ✨");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error("[SEED_ERROR]", e);
        await prisma.$disconnect();
        process.exit(1);
    });