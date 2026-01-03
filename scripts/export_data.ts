
import { prisma } from '../app/lib/prisma';
import fs from 'fs';
import path from 'path';

async function main() {
    // Export Users
    const users = await prisma.user.findMany();
    const usersCsv = [
        ['id', 'name', 'email', 'createdAt'].join(','),
        ...users.map(u => [
            u.id,
            `"${u.name || ''}"`,
            u.email || '',
            u.createdAt.toISOString()
        ].join(','))
    ].join('\n');

    const usersPath = path.join(process.cwd(), 'users_export.csv');
    fs.writeFileSync(usersPath, usersCsv);
    console.log(`✅ Users exported to: ${usersPath}`);

    // Export Words
    const words = await prisma.word.findMany();
    if (words.length > 0) {
        // Get headers from first word object
        const headers = Object.keys(words[0]);

        // Create CSV content
        const wordsCsv = [
            headers.join(','),
            ...words.map(w => headers.map(h => {
                const val = (w as any)[h];
                if (val === null || val === undefined) return '';
                if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`; // Escape quotes
                if (val instanceof Date) return val.toISOString();
                return val;
            }).join(','))
        ].join('\n');

        const wordsPath = path.join(process.cwd(), 'words_export.csv');
        fs.writeFileSync(wordsPath, wordsCsv);
        console.log(`✅ Words exported to: ${wordsPath}`);
    } else {
        console.log('⚠️ No words found to export.');
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
