import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
// Load envs
dotenv.config({ path: '.env.local' });
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    const email = 'abcxyoung@gmail.com';
    console.log(`Checking user: ${email}`);

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { accounts: true }
        });

        if (!user) {
            console.log('User NOT found.');
        } else {
            console.log('User FOUND:', JSON.stringify(user, null, 2));
            if (user.accounts.length === 0) {
                console.log('User has NO accounts linked.');
            }
        }
    } catch (e) {
        console.error("DB Error:", e);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
