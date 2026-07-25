/**
 * Seeds realistic demo data so the app isn't empty for a demo/interview.
 * Safe to re-run — skips sections that already have data instead of
 * duplicating everything.
 *
 * Usage:
 *   npx tsx prisma/seed.ts
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // ── Demo users ────────────────────────────────────────────────────────
  const demoUsersData = [
    { name: 'Sarah Ahmed', email: 'sarah.demo@prepwise.app', password: 'demo1234' },
    { name: 'Rafiq Islam', email: 'rafiq.demo@prepwise.app', password: 'demo1234' },
    { name: 'Nabila Karim', email: 'nabila.demo@prepwise.app', password: 'demo1234' },
  ]

  const demoUsers = []
  for (const u of demoUsersData) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } })
    if (existing) {
      demoUsers.push(existing)
      continue
    }
    const hashed = await bcrypt.hash(u.password, 10)
    const created = await prisma.user.create({
      data: { name: u.name, email: u.email, password: hashed },
    })
    demoUsers.push(created)
  }
  const [sarah, rafiq, nabila] = demoUsers
  console.log(`Demo users ready (login: sarah.demo@prepwise.app / demo1234, etc.)`)

  // ── Interview questions ──────────────────────────────────────────────
  const questionCount = await prisma.interviewQuestion.count()
  if (questionCount === 0) {
    await prisma.interviewQuestion.createMany({
      data: [
        { category: 'DSA', difficulty: 'EASY', question: 'Reverse a linked list.', answer: 'Iterate with three pointers (prev, curr, next), reversing the `next` pointer at each step. O(n) time, O(1) space.' },
        { category: 'DSA', difficulty: 'EASY', question: 'Find the maximum element in an array.', answer: 'Single pass, track running max. O(n) time.' },
        { category: 'DSA', difficulty: 'MEDIUM', question: 'Detect a cycle in a linked list.', answer: 'Floyd\'s cycle detection (slow/fast pointers). If they meet, there\'s a cycle.' },
        { category: 'DSA', difficulty: 'MEDIUM', question: 'Find the longest substring without repeating characters.', answer: 'Sliding window with a hash set tracking characters in the current window.' },
        { category: 'DSA', difficulty: 'HARD', question: 'Implement an LRU cache with O(1) get/put.', answer: 'Combine a hash map with a doubly linked list to track recency in O(1).' },
        { category: 'System Design', difficulty: 'MEDIUM', question: 'Design a URL shortener like bit.ly.', answer: 'Base62 encoding of an auto-increment ID or hash, key-value store for lookups, cache layer for hot URLs, redirect via 301/302.' },
        { category: 'System Design', difficulty: 'MEDIUM', question: 'How would you design a rate limiter?', answer: 'Token bucket or sliding window log, typically backed by Redis for distributed systems.' },
        { category: 'System Design', difficulty: 'HARD', question: 'Design a notification system that scales to millions of users.', answer: 'Message queue (Kafka/SQS) decoupling producers from delivery workers, fan-out per channel (push/email/SMS), retry with backoff, dedup via idempotency keys.' },
        { category: 'Behavioral', difficulty: 'EASY', question: 'Tell me about a time you disagreed with a teammate.', answer: 'Use the STAR method — focus on how you communicated, sought to understand their view, and reached resolution.' },
        { category: 'Behavioral', difficulty: 'MEDIUM', question: 'Describe a project that failed. What did you learn?', answer: 'Be honest about the failure, own your part in it, and clearly articulate the concrete change in how you work now.' },
        { category: 'Behavioral', difficulty: 'MEDIUM', question: 'How do you handle competing priorities with tight deadlines?', answer: 'Explain your prioritization framework (impact vs effort, stakeholder alignment) with a concrete example.' },
        { category: 'Frontend', difficulty: 'EASY', question: 'What is the virtual DOM and why does React use it?', answer: 'An in-memory representation of the UI; React diffs it against the previous version to minimize expensive real DOM updates.' },
        { category: 'Frontend', difficulty: 'MEDIUM', question: 'Explain the difference between useMemo and useCallback.', answer: 'useMemo memoizes a computed value; useCallback memoizes a function reference. Both prevent unnecessary recalculation/re-renders.' },
        { category: 'Frontend', difficulty: 'MEDIUM', question: 'How does CSS specificity work?', answer: 'Inline styles > IDs > classes/attributes/pseudo-classes > elements. Higher specificity wins regardless of source order.' },
        { category: 'Backend', difficulty: 'EASY', question: 'What is the difference between SQL and NoSQL databases?', answer: 'SQL: structured schema, ACID transactions, relational joins. NoSQL: flexible schema, horizontal scalability, eventual consistency (varies by type).' },
        { category: 'Backend', difficulty: 'MEDIUM', question: 'Explain how JWT authentication works.', answer: 'Server signs a token containing claims with a secret; client sends it on each request; server verifies the signature without needing a DB lookup (stateless).' },
        { category: 'Backend', difficulty: 'HARD', question: 'How would you handle a race condition in a payment system?', answer: 'Database-level locking (SELECT FOR UPDATE), idempotency keys on requests, or optimistic concurrency with version numbers.' },
        { category: 'HR', difficulty: 'EASY', question: 'Why do you want to work here?', answer: 'Research the company\'s mission/products specifically — avoid generic answers, connect it to your own goals.' },
        { category: 'HR', difficulty: 'EASY', question: 'What are your salary expectations?', answer: 'Research market rate for the role/location first, give a researched range, and stay flexible on framing.' },
        { category: 'HR', difficulty: 'MEDIUM', question: 'Where do you see yourself in 5 years?', answer: 'Show ambition aligned with growth paths that plausibly exist at this company, without over-promising specifics.' },
      ],
    })
    console.log('Seeded 20 interview questions')
  } else {
    console.log(`Interview questions already exist (${questionCount}) — skipped`)
  }

  // ── Mock tests ────────────────────────────────────────────────────────
  const testCount = await prisma.mockTest.count()
  if (testCount === 0) {
    await prisma.mockTest.create({
      data: {
        title: 'JavaScript Fundamentals',
        category: 'Frontend',
        duration: 15,
        questions: {
          create: [
            { question: 'What does `typeof null` return in JavaScript?', options: ['"null"', '"object"', '"undefined"', '"number"'], answer: '"object"' },
            { question: 'Which method adds an element to the end of an array?', options: ['push()', 'pop()', 'shift()', 'unshift()'], answer: 'push()' },
            { question: 'What is a closure?', options: ['A loop construct', 'A function with access to its outer scope', 'A type of array', 'A CSS property'], answer: 'A function with access to its outer scope' },
            { question: 'What does "===" check that "==" does not?', options: ['Nothing, they are identical', 'Type in addition to value', 'Only type', 'Only value'], answer: 'Type in addition to value' },
            { question: 'Which keyword declares a block-scoped variable?', options: ['var', 'let', 'function', 'global'], answer: 'let' },
          ],
        },
      },
    })
    await prisma.mockTest.create({
      data: {
        title: 'System Design Basics',
        category: 'System Design',
        duration: 20,
        questions: {
          create: [
            { question: 'What does CAP theorem stand for?', options: ['Consistency, Availability, Partition tolerance', 'Cache, API, Performance', 'Compute, Access, Persistence', 'Cluster, Async, Parallel'], answer: 'Consistency, Availability, Partition tolerance' },
            { question: 'What is the primary purpose of a load balancer?', options: ['Store data', 'Distribute traffic across servers', 'Encrypt requests', 'Compress responses'], answer: 'Distribute traffic across servers' },
            { question: 'What is database sharding?', options: ['Backing up a database', 'Splitting data across multiple databases', 'Encrypting a database', 'Compressing a database'], answer: 'Splitting data across multiple databases' },
            { question: 'What does a CDN primarily improve?', options: ['Write speed', 'Static content delivery latency', 'Database consistency', 'Authentication'], answer: 'Static content delivery latency' },
          ],
        },
      },
    })
    console.log('Seeded 2 mock tests')
  } else {
    console.log(`Mock tests already exist (${testCount}) — skipped`)
  }

  // ── Jobs (pre-verified so they show up publicly without manual approval) ─
  const jobCount = await prisma.job.count()
  if (jobCount === 0) {
    const jobsData = [
      { title: 'Frontend Developer', company: 'Pathao', location: 'Dhaka, Bangladesh', category: 'Engineering', type: 'FULL_TIME' as const, description: 'Build and maintain customer-facing React interfaces for our ride-sharing platform.', postedById: sarah.id },
      { title: 'Backend Engineer (Node.js)', company: 'bKash', location: 'Dhaka, Bangladesh', category: 'Engineering', type: 'FULL_TIME' as const, description: 'Design and scale APIs handling millions of daily mobile financial transactions.', postedById: sarah.id },
      { title: 'Product Design Intern', company: 'Chaldal', location: 'Dhaka, Bangladesh', category: 'Design', type: 'INTERNSHIP' as const, description: 'Support the design team on user research and UI iteration for our grocery delivery app.', postedById: rafiq.id },
      { title: 'Data Analyst', company: 'Grameenphone', location: 'Dhaka, Bangladesh', category: 'Finance', type: 'FULL_TIME' as const, description: 'Analyze subscriber usage patterns to inform product and pricing decisions.', postedById: rafiq.id },
      { title: 'Remote React Native Developer', company: 'Optimizely', location: 'Remote', category: 'Engineering', type: 'REMOTE' as const, description: 'Join a distributed team building experimentation tooling used by Fortune 500 companies.', postedById: nabila.id },
      { title: 'DevOps Engineer', company: 'Therap BD', location: 'Dhaka, Bangladesh', category: 'Engineering', type: 'FULL_TIME' as const, description: 'Own our CI/CD pipeline and AWS infrastructure for a healthcare SaaS platform.', postedById: nabila.id },
      { title: 'Marketing Coordinator', company: 'Daraz', location: 'Dhaka, Bangladesh', category: 'Marketing', type: 'PART_TIME' as const, description: 'Support campaign execution across our e-commerce marketing channels.', postedById: sarah.id },
      { title: 'QA Engineer', company: 'Brain Station 23', location: 'Dhaka, Bangladesh', category: 'Engineering', type: 'FULL_TIME' as const, description: 'Design and execute test plans for enterprise software delivered to global clients.', postedById: rafiq.id },
      { title: 'HR Generalist', company: 'Robi Axiata', location: 'Dhaka, Bangladesh', category: 'HR', type: 'FULL_TIME' as const, description: 'Support recruitment and employee engagement initiatives at scale.', postedById: nabila.id },
      { title: 'Junior Software Engineer', company: 'Google', location: 'Remote', category: 'Engineering', type: 'FULL_TIME' as const, description: 'Entry-level engineering role on a global infrastructure team.', postedById: sarah.id },
    ]
    for (const job of jobsData) {
      await prisma.job.create({ data: { ...job, verified: true, verifiedAt: new Date() } })
    }

    // A couple of PENDING jobs too — otherwise your Admin Dashboard's
    // "Pending Jobs" tab has nothing to demo the approve/reject flow with.
    await prisma.job.create({
      data: {
        title: 'Cloud Support Engineer', company: 'Sheba.xyz', location: 'Dhaka, Bangladesh',
        category: 'Engineering', type: 'FULL_TIME', description: 'Support our cloud infrastructure and customer integrations.',
        postedById: rafiq.id, verified: false,
      },
    })
    await prisma.job.create({
      data: {
        title: 'Growth Marketing Intern', company: 'ShopUp', location: 'Dhaka, Bangladesh',
        category: 'Marketing', type: 'INTERNSHIP', description: 'Support growth experiments across our seller acquisition funnels.',
        postedById: nabila.id, verified: false,
      },
    })

    console.log(`Seeded ${jobsData.length} verified jobs + 2 pending jobs (for the admin approval demo)`)
  } else {
    console.log(`Jobs already exist (${jobCount}) — skipped`)
  }

  // ── Community posts (deliberately repeats a few companies so "Company
  //    Insights" has something real to aggregate) ─────────────────────────
  const postCount = await prisma.communityPost.count()
  if (postCount === 0) {
    const postsData = [
      { userId: sarah.id, company: 'Google', role: 'Software Engineer', content: 'Had my onsite loop last week — 4 rounds of DSA, 1 system design, 1 behavioral. The interviewers were very collaborative, they wanted to see how I think through edge cases rather than just getting the "right" answer fast.', tags: ['DSA', 'System Design', 'Behavioral'] },
      { userId: rafiq.id, company: 'Google', role: 'Frontend Developer', content: 'My phone screen focused heavily on JavaScript fundamentals — closures, event loop, promises. Make sure you can explain these without looking at code.', tags: ['Frontend', 'DSA'] },
      { userId: nabila.id, company: 'Google', role: 'Product Manager', content: 'PM interviews here are much more about structured thinking than "gotcha" questions. They gave me a vague prompt and wanted to see how I\'d clarify scope before jumping to solutions.', tags: ['Behavioral', 'Product'] },
      { userId: sarah.id, company: 'Microsoft', role: 'Backend Developer', content: 'Got asked to design a rate limiter from scratch, then had to code a basic version live. Practicing System Design questions really paid off here.', tags: ['System Design', 'DSA'] },
      { userId: rafiq.id, company: 'Microsoft', role: 'Data Scientist', content: 'A lot of statistics fundamentals — A/B testing, confidence intervals. Not just ML theory.', tags: ['Technical'] },
      { userId: nabila.id, company: 'Pathao', role: 'Product Manager', content: 'Very startup-paced process — one interview to offer in under a week. They cared a lot about local market context given it\'s a Bangladesh-focused platform.', tags: ['Behavioral'] },
      { userId: sarah.id, company: 'bKash', role: 'Backend Engineer', content: 'Heavy focus on system reliability given it\'s a financial platform — expect questions about idempotency, race conditions, and transaction safety.', tags: ['Backend', 'System Design'] },
      { userId: rafiq.id, company: 'Amazon', role: 'SDE II', content: 'Leadership principles came up in every single round, even the technical ones. Have concrete stories ready for each principle, not just the behavioral round.', tags: ['Behavioral', 'DSA'] },
    ]
    for (const p of postsData) {
      await prisma.communityPost.create({ data: { ...p, likes: [] } })
    }

    // One post that gets reported — otherwise Admin Dashboard's "Reported
    // Posts" tab has nothing to demo the moderation flow with.
    const reportablePost = await prisma.communityPost.create({
      data: {
        userId: rafiq.id, company: 'Random Corp', role: 'Sales Associate',
        content: 'This is a spammy/off-topic post used to demo the report + moderation flow.',
        tags: [], likes: [],
      },
    })
    await prisma.postReport.create({
      data: { postId: reportablePost.id, userId: sarah.id, reason: 'Looks like spam, not a real interview experience.' },
    })

    console.log(`Seeded ${postsData.length} community posts + 1 reported post (for the admin moderation demo)`)
  } else {
    console.log(`Community posts already exist (${postCount}) — skipped`)
  }

  // ── Tracker entries + a small streak for the primary demo account ──────
  const trackerCount = await prisma.jobTracker.count({ where: { userId: sarah.id } })
  if (trackerCount === 0) {
    await prisma.jobTracker.createMany({
      data: [
        { userId: sarah.id, companyName: 'Pathao', jobTitle: 'Frontend Developer', status: 'INTERVIEW', stage: 'TECHNICAL', notes: 'Second round scheduled next week.' },
        { userId: sarah.id, companyName: 'bKash', jobTitle: 'Backend Engineer', status: 'APPLIED', stage: 'RESUME' },
        { userId: sarah.id, companyName: 'Chaldal', jobTitle: 'Product Designer', status: 'OFFER', stage: 'FINAL', notes: 'Offer received! Deciding by Friday.' },
        { userId: sarah.id, companyName: 'Daraz', jobTitle: 'Marketing Coordinator', status: 'REJECTED', stage: 'PHONE_SCREEN' },
      ],
    })
    console.log('Seeded 4 tracker entries for the demo account')
  } else {
    console.log('Tracker entries already exist for demo account — skipped')
  }

  await prisma.user.update({
    where: { id: sarah.id },
    data: { currentStreak: 4, longestStreak: 7, lastActiveDate: new Date() },
  })
  console.log('Set a 4-day streak on the primary demo account for a nicer Home screen demo')

  // ── Mock test result (so "My Results" isn't empty) ─────────────────────
  const existingResult = await prisma.testResult.findFirst({ where: { userId: sarah.id } })
  if (!existingResult) {
    const jsTest = await prisma.mockTest.findFirst({ where: { title: 'JavaScript Fundamentals' } })
    if (jsTest) {
      await prisma.testResult.create({
        data: { userId: sarah.id, testId: jsTest.id, score: 4, total: 5 },
      })
      console.log('Seeded a mock test result for the demo account')
    }
  }

  // ── AI interview history (so the "past interviews" list isn't empty) ───
  const existingInterview = await prisma.aiInterviewSession.findFirst({ where: { userId: sarah.id } })
  if (!existingInterview) {
    const session = await prisma.aiInterviewSession.create({
      data: {
        userId: sarah.id,
        role: 'Frontend Developer',
        category: 'System Design',
        status: 'COMPLETED',
        finalScore: 78,
        finalFeedback: 'Solid grasp of core system design tradeoffs, especially around caching. Could go deeper on failure modes and how you\'d monitor the system in production.',
        strengths: ['Clear communication', 'Good use of concrete examples'],
        improvements: ['Discuss failure modes earlier', 'Quantify scale assumptions up front'],
        completedAt: new Date(),
        messages: {
          create: [
            { sender: 'AI', content: 'Let\'s design a URL shortener. How would you approach the core architecture?' },
            { sender: 'USER', content: 'I\'d start with a hash-based approach — encode the auto-increment ID as base62 for short URLs, store the mapping in a key-value store, and add a cache layer for hot redirects.' },
            { sender: 'AI', content: 'Good start. You mentioned a cache layer — what would you cache, and what eviction policy would you use?' },
            { sender: 'USER', content: 'I\'d cache the most frequently accessed short-to-long URL mappings using an LRU policy, since redirect traffic tends to follow a power law where a small number of links get most of the clicks.' },
          ],
        },
      },
    })
    console.log('Seeded a completed AI interview session for the demo account')
  }

  console.log('\nDone. Log in with: sarah.demo@prepwise.app / demo1234 (has tracker entries, streak, test result, and AI interview history)')
}

main()
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())