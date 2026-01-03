
import { prisma } from '../app/lib/prisma';

async function main() {
    console.log('Seeding cloud database...');

    // 1. Create Users
    const user1 = await prisma.user.upsert({
        where: { id: '1767170999959' },
        update: {},
        create: {
            id: '1767170999959',
            name: 'User 1767170999959'
        }
    });

    const userDefault = await prisma.user.upsert({
        where: { id: 'default' },
        update: {},
        create: {
            id: 'default',
            name: 'Explorer'
        }
    });

    console.log('Users ensured.');

    // 2. Create Words
    // We use upsert or create. Since DB is empty, create is fine.
    // We will use the exact data found previously.
    const words = [
        {
            id: 'cmjv3x0lb0001bhz1u5cz7quv',
            userId: '1767170999959',
            word: 'feature',
            definition: 'A special or important part of something that helps you notice it.',
            sentence: 'The coolest feature of the new toy robot is that it can fly!',
            imageUrl: "https://pollinations.ai/p/A%20bright%2C%20cheerful%20park%20scene%20on%20a%20sunny%20day.%20In%20the%20foreground%2C%20a%20happy%208-year-old%20child%20with%20a%20wide%20smile%20is%20pointing%20with%20excitement%20and%20a%20grand%20gesture%20towards%20a%20magnificent%2C%20towering%2C%20rainbow-colored%20slide%20that%20is%20much%20taller%20and%20more%20elaborate%20than%20the%20other%20equipment.%20The%20slide%20is%20clearly%20the%20star%20of%20the%20playground.%20Other%20smaller%2C%20regular%20playground%20items%20like%20a%20swing%20set%2C%20a%20sandbox%2C%20and%20a%20seesaw%20are%20visible%20in%20the%20background%2C%20with%20other%20children%20playing%20on%20them%2C%20but%20the%20super%20slide%20is%20the%20most%20eye-catching%20and%20the%20focal%20point.%20The%20colors%20are%20vibrant%20and%20friendly%2C%20with%20lush%20green%20grass%20and%20a%20clear%20blue%20sky.%20The%20overall%20feeling%20is%20joyful%20and%20highlights%20the%20'special%20part'%20of%20the%20playground.%20cartoon%20style%20children%20book%20illustration?width=800&height=600&seed=164&nologo=true",
            gradeLevel: 3,
            difficulty: 'EASY',
            isStarred: false,
            comment: "When we talk about movies, the main movie is sometimes called the 'feature film'!",
            mastery: 20,
            views: 1,
            createdAt: "2026-01-01T07:11:45.216Z",
        },
        {
            id: 'cmjv3y86n0003bhz18kue38bf',
            userId: '1767170999959',
            word: 'feature',
            definition: 'A feature is a special part, look, or quality that something has, like the color of a car or a button on a toy.',
            sentence: 'My favorite feature of the new playground is the super tall slide!',
            imageUrl: 'https://placehold.co/400x300/A2D8A2/ffffff.png?text=feature',
            gradeLevel: 2,
            difficulty: 'EASY',
            isStarred: false,
            comment: "When people talk about someone's face, they often call their eyes or nose 'facial features.'",
            mastery: 0,
            views: 0,
            createdAt: "2026-01-01T07:12:41.712Z"
        },
        {
            id: 'cmjv431pa0005bhz1mql8tn2m',
            userId: '1767170999959',
            word: 'feature',
            definition: "A special part or a noticeable thing that helps you describe or understand something. It's like a cool detail that stands out.",
            sentence: 'The best feature of the new toy robot is that it can actually talk and sing.',
            imageUrl: 'https://placehold.co/400x300/A2D8A2/ffffff.png?text=feature',
            gradeLevel: 2,
            difficulty: 'EASY',
            isStarred: false,
            comment: "When talking about the Earth, a 'feature' could be a huge mountain or a deep ocean, called a geographical feature.",
            mastery: 0,
            views: 0,
            createdAt: "2026-01-01T07:16:26.591Z"
        },
        {
            id: 'cmjv43ayd0007bhz1syj6pu7s',
            userId: '1767170999959',
            word: 'garden',
            definition: 'A special outdoor spot where people grow pretty flowers, tasty vegetables, or other plants.',
            sentence: 'My grandpa and I are going to water the tomatoes in the garden this afternoon.',
            imageUrl: 'https://placehold.co/400x300/A2D8A2/ffffff.png?text=garden',
            gradeLevel: 1,
            difficulty: 'EASY',
            isStarred: false,
            comment: "Some of the biggest gardens in the world are called 'botanical gardens' and have thousands of different kinds of plants!",
            mastery: 0,
            views: 0,
            createdAt: "2026-01-01T07:16:38.582Z"
        },
        {
            id: 'cmjv4a4ae0009bhz1jhq6awka',
            userId: '1767170999959',
            word: 'garden',
            definition: 'A special outdoor area, usually with soil, where people grow beautiful flowers, trees, or yummy vegetables and fruits.',
            sentence: 'My little sister loves to visit the garden every morning to see if the zucchini and carrots have grown bigger.',
            imageUrl: 'https://pollinations.ai/p/A%20bright%2C%20sunny%20outdoor%20scene%20showing%20a%20small%2C%20well-kept%20garden.%20In%20the%20foreground%2C%20there%20are%20rows%20of%20tall%2C%20cheerful%20sunflowers%20and%20neat%20rows%20of%20bright%20red%20strawberries%20and%20green%20leafy%20lettuce.%20A%20smiling%20child%20(around%208%20years%20old)%20wearing%20bright%20red%20boots%20is%20gently%20watering%20a%20purple%20flower%20with%20a%20tiny%20blue%20watering%20can.%20A%20happy%20yellow%20bumblebee%20is%20buzzing%20near%20a%20rosebush%20in%20the%20background.%20The%20colors%20should%20be%20saturated%20and%20friendly%2C%20emphasizing%20growth%20and%20life.%20cartoon%20style%20children%20book%20illustration?width=800&height=600&seed=623',
            gradeLevel: 2,
            difficulty: 'EASY',
            isStarred: false,
            comment: 'The biggest pumpkin ever grown came from a garden and weighed more than a small car!',
            mastery: 0,
            views: 0,
            createdAt: "2026-01-01T07:21:56.534Z"
        }
    ];

    for (const w of words) {
        await prisma.word.upsert({
            where: { id: w.id },
            update: {},
            create: {
                ...w,
                createdAt: new Date(w.createdAt) // Parse timestamp
            }
        });
    }

    console.log(`Seeded ${words.length} words successfully.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
