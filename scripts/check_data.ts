
import { prisma } from '../app/lib/prisma';

async function main() {
    const users = await prisma.user.findMany({
        include: {
            _count: {
                select: { words: true }
            }
        }
    });

    console.log('Users found:', users.length);
    users.forEach(u => {
        console.log(`User: ${u.id} (${u.name}), Words: ${u._count.words}`);
    });

    const words = await prisma.word.findMany({ take: 5 });
    console.log('Sample words:', words);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
