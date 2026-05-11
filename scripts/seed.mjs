#!/usr/bin/env node
/**
 * Seed the backend with a demo user and a handful of quizzes.
 *
 * Usage:
 *   npm run seed                     # uses defaults
 *   API_URL=http://localhost:3000 EMAIL=demo@quizup.test PASSWORD=Demo123! npm run seed
 *
 * Idempotent: if the demo user already exists, registration is ignored and we still log in.
 * Quizzes are appended each run (the backend doesn't dedupe by name), so don't reseed in a loop.
 */

const API_URL = process.env.API_URL ?? 'http://localhost:3000';
const EMAIL = process.env.EMAIL ?? 'demo@quizup.test';
const PASSWORD = process.env.PASSWORD ?? 'Demo123!';

const post = async (path, body, token) => {
    const res = await fetch(`${API_URL}${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? {Authorization: `Bearer ${token}`} : {}),
        },
        body: JSON.stringify(body),
    });
    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : {}; } catch { data = {raw: text}; }
    return {status: res.status, data};
};

const q = (question, options, correctIndex) => ({
    question,
    correctAnswer: options[correctIndex],
    options: options.map((label, i) => ({label, isCorrect: i === correctIndex})),
});

const QUIZZES = [
    {
        name: "Photosynthesis: Plants' Side Hustle",
        topic: 'biology',
        questions: [
            q("Which gas do plants release as a thank-you for letting them breathe?",
              ['Carbon dioxide', 'Oxygen', 'Nitrogen', 'Awkward silence'], 1),
            q("Which green pigment does most of the actual work?",
              ['Carotene', 'Chlorophyll', 'Melatonin', 'Pesto'], 1),
            q("Where does most of a tree's mass come from?",
              ['The soil', 'The roots', 'The air', 'A tiny plant gym membership'], 2),
            q("Which part of the plant absorbs sunlight?",
              ['Roots', 'Stem', 'Leaves', 'Wikipedia'], 2),
            q("When the sun sets, plants…",
              ['Sleep', 'Switch to respiration', 'Photosynthesize moonlight', 'File a complaint'], 1),
        ],
    },
    {
        name: 'Capitals That Aren’t What You Think',
        topic: 'geography',
        questions: [
            q("Capital of Australia?",
              ['Sydney', 'Melbourne', 'Canberra', 'Adelaide'], 2),
            q("Capital of Turkey?",
              ['Istanbul', 'Ankara', 'Izmir', 'Antalya'], 1),
            q("Capital of Brazil?",
              ['Rio de Janeiro', 'Brasília', 'São Paulo', 'Salvador'], 1),
            q("Executive capital of South Africa?",
              ['Cape Town', 'Johannesburg', 'Pretoria', 'Durban'], 2),
            q("Capital of Canada?",
              ['Toronto', 'Vancouver', 'Ottawa', 'Montréal'], 2),
        ],
    },
    {
        name: 'Math Words People Misuse',
        topic: 'math',
        questions: [
            q("π is approximately…",
              ['3.14', '22/7 (close enough)', 'Pumpkin', 'Irrational and rude'], 0),
            q("A prime number is divisible by…",
              ['Itself and 1', '2 and itself', 'Your dignity', 'Anything cute'], 0),
            q("The hypotenuse is…",
              ['The longest side of a right triangle', 'A small horse', 'The opposite angle', 'A type of acid'], 0),
            q("An obtuse angle is…",
              ['Less than 90°', 'Exactly 90°', 'Greater than 90° and less than 180°', 'Just kind of thick'], 2),
            q("Zero factorial (0!) equals…",
              ['0', '1', 'Undefined', 'Nothing, calm down'], 1),
        ],
    },
    {
        name: 'Space: Surprisingly Empty',
        topic: 'space',
        questions: [
            q("Which planet has the most known moons?",
              ['Jupiter', 'Saturn', 'Uranus', 'Earth (we’re trying)'], 1),
            q("How long does sunlight take to reach Earth?",
              ['Instant', 'About 8 minutes', 'About 8 hours', 'It’s been on the way'], 1),
            q("What sits at the center of the Milky Way?",
              ['A supermassive black hole', 'Another galaxy', 'Mostly cheese', 'Customer service'], 0),
            q("Which is the smallest planet in our solar system?",
              ['Earth', 'Mars', 'Mercury', 'Pluto (rest in peace)'], 2),
            q("How many planets in our solar system are gas giants?",
              ['2', '3', '4', 'All of them, secretly'], 2),
        ],
    },
    {
        name: 'History’s Greatest Hits',
        topic: 'history',
        questions: [
            q("What year did World War II end?",
              ['1943', '1944', '1945', '1946'], 2),
            q("Who painted the Sistine Chapel ceiling?",
              ['Leonardo da Vinci', 'Michelangelo', 'Raphael', 'Donatello (the turtle was inspired)'], 1),
            q("The Berlin Wall fell in…",
              ['1987', '1989', '1991', 'Nobody saw it coming'], 1),
            q("Cleopatra was the last ruler of…",
              ['Greece', 'Ptolemaic Egypt', 'Rome', 'Persia'], 1),
            q("Who was the first person to walk on the Moon?",
              ['Buzz Aldrin', 'Yuri Gagarin', 'Neil Armstrong', 'Michael Collins'], 2),
        ],
    },
    {
        name: 'Movies That Sound Worse on Paper',
        topic: 'movies',
        questions: [
            q("Plot: lone scientist regrows extinct lizards as a theme park attraction.",
              ['Jaws', 'Jurassic Park', 'Avatar', 'The Lion King'], 1),
            q("Plot: child finds out he can do magic, gets bussed off to a school for it.",
              ['Matilda', 'Harry Potter', 'The Sandlot', 'The Karate Kid'], 1),
            q("Plot: man falls into pit, climbs out, takes care of business.",
              ['The Shawshank Redemption', 'The Dark Knight Rises', '127 Hours', 'The Revenant'], 1),
            q("Plot: young woman loses shoe at party, leaves footwear-shaped mess for everyone else to clean up.",
              ['Pretty Woman', 'Cinderella', 'Mean Girls', 'Step Up'], 1),
            q("Plot: rats secretly run a Parisian restaurant.",
              ['Finding Nemo', 'Ratatouille', 'Up', 'The Aristocats'], 1),
        ],
    },
    {
        name: 'Programming Jargon Trivia',
        topic: 'programming',
        questions: [
            q("What does HTML stand for?",
              ['HyperText Markup Language', 'How To Make Lasagna', 'High-Tech Marketing Loop', 'Heavy Text Manipulation Library'], 0),
            q("Who created Python?",
              ['Linus Torvalds', 'Guido van Rossum', 'James Gosling', 'The python itself'], 1),
            q("The original software “bug” was named after…",
              ['An actual moth jammed in a relay', 'A long typo', 'A frustrated engineer', 'A six-legged feature'], 0),
            q("What does API stand for?",
              ['Application Programming Interface', 'Annoying Persistent Issue', 'Always Producing Incidents', 'Almost Possibly Indexed'], 0),
            q("Big-O notation describes…",
              ['Code prettiness', 'Algorithmic efficiency', 'Variable name length', 'Coffee strength'], 1),
        ],
    },
    {
        name: 'Animals Are Weirder Than Fiction',
        topic: 'animals',
        questions: [
            q("How many hearts does an octopus have?",
              ['1', '2', '3', 'It’s complicated'], 2),
            q("Why are flamingos pink?",
              ['Their diet', 'Genetics', 'Embarrassment', 'They keep stealing lipstick'], 0),
            q("How long can a tardigrade survive in the vacuum of space?",
              ['A few seconds', 'A few minutes', 'About 10 days', 'They’ve sued NASA over it'], 2),
            q("A group of crows is called…",
              ['A flock', 'A murder', 'A cabinet', 'A focus group'], 1),
            q("True or false: honey bees can recognize individual human faces.",
              ['True', 'False', 'Only if you wave first', 'Only their keepers'], 0),
        ],
    },
];

const main = async () => {
    console.log(`Seeding ${API_URL} as ${EMAIL}…`);

    const reg = await post('/authentication/register', {email: EMAIL, password: PASSWORD});
    if (reg.status === 201) {
        console.log('  ✓ registered');
    } else if (reg.status === 400 || reg.status === 409) {
        console.log('  · already exists, skipping register');
    } else {
        console.log(`  ! register returned ${reg.status}:`, reg.data);
    }

    const login = await post('/authentication/login', {email: EMAIL, password: PASSWORD});
    if (login.status !== 200 && login.status !== 201) {
        console.error('  ✗ login failed:', login.status, login.data);
        process.exit(1);
    }
    const token = login.data.accessToken;
    if (!token) {
        console.error('  ✗ login returned no accessToken:', login.data);
        process.exit(1);
    }
    console.log('  ✓ logged in');

    let created = 0;
    for (const quiz of QUIZZES) {
        const payload = {name: quiz.name, code: null, topic: quiz.topic, questions: quiz.questions};
        const res = await post('/quizzes', payload, token);
        if (res.status === 201 || res.status === 200) {
            console.log(`  ✓ ${quiz.name}`);
            created++;
        } else {
            console.log(`  ✗ ${quiz.name} — ${res.status}`, res.data);
        }
    }

    console.log(`\nDone. Created ${created}/${QUIZZES.length} quizzes.`);
    console.log(`Log in as ${EMAIL} / ${PASSWORD} to see them.`);
};

main().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
