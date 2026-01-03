import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
// Load envs
dotenv.config({ path: '.env.local' });
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    const email = 'abcxyoung@gmail.com';
    console.log(`Fixing user: ${email}`);

    try {
        const user = await prisma.user.update({
            where: { email },
            data: {
                emailVerified: new Date()
            },
            include: { accounts: true }
        });

        console.log('User Updated:', JSON.stringify(user, null, 2));
    } catch (e) {
        console.error("DB Error (User might not exist):", e);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
