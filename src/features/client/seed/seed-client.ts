import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client"; // Or "@prisma/client" depending on your output

const connectionString = `${process.env.DATABASE_URL}`;

// Skip `new Pool(...)` entirely — pass the config object directly:
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
    const workspace = await prisma.workspace.findFirst();

    if (!workspace) {
        throw new Error("No workspace found! Please create an account in the UI first."); d: \Project Ideas\AgencyFlow\MVP_Module_Features.docx
    }

    console.log(`Seeding clients for Workspace: "${workspace.name}"...`);

    const clientsData = [
        { name: "Acme Corporation", contactName: "Jane Doe", contactEmail: "jane@acme.com", workspaceId: workspace.id },
        { name: "Stark Industries", contactName: "Tony Stark", contactEmail: "tony@stark.com", workspaceId: workspace.id },
        { name: "Wayne Enterprises", contactName: "Lucius Fox", contactEmail: "lfox@wayne.com", workspaceId: workspace.id },
    ];

    for (const client of clientsData) {
        const created = await prisma.client.create({ data: client });
        console.log(`Created Client: ${created.name} (${created.id})`);
    }

    console.log("Client seeding complete!");
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

