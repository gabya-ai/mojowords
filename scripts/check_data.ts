
import { prisma } from '../app/lib/prisma';

async function main() {
    const users = await prisma.user.findMany({
        include: {
            _count: {
                select: { children: true }
            }
        }
    });

    console.log('Users found:', users.length);
    users.forEach(u => {
        console.log(`User: ${u.id} (${u.name}), Children: ${u._count.children}`);
    });

    const profiles = await prisma.childProfile.findMany({ take: 5, include: { words: true } });
    console.log('Sample profiles:', profiles.length);
    profiles.forEach(p => {
        console.log(`Child: ${p.name}, Words: ${p.words.length}`);
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
