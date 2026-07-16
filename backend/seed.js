/**
 * seed.js
 *
 * Populates MongoDB with realistic sample data for Mak Tech.
 * Place this file in: backend/seed.js
 * Run with: node seed.js
 *
 * Requires your models to already exist at ./models/*
 * and a MONGODB_URI in your .env file.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Admin = require('./models/Admin');
const Category = require('./models/Category');
const App = require('./models/App');
const Review = require('./models/Review');
const Favorite = require('./models/Favorite');
const RecentlyViewed = require('./models/RecentlyViewed');
const DailyFeatured = require('./models/DailyFeatured');
const Notification = require('./models/Notification');
const Device = require('./models/Device');

// Use the same database setting as the running API server. This prevents seed
// data being written to a different database than the mobile app reads from.
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/maktech';

// ---------------------------------------------------------------------------
// 1. CATEGORIES
// ---------------------------------------------------------------------------
const categories = [
  { name: 'AI Tools', slug: 'ai', iconUrl: 'https://cdn-icons-png.flaticon.com/512/8637/8637099.png', sortOrder: 1 },
  { name: 'Productivity', slug: 'productivity', iconUrl: 'https://cdn-icons-png.flaticon.com/512/1611/1611179.png', sortOrder: 2 },
  { name: 'Education', slug: 'education', iconUrl: 'https://cdn-icons-png.flaticon.com/512/2932/2932947.png', sortOrder: 3 },
  { name: 'Utilities', slug: 'utilities', iconUrl: 'https://cdn-icons-png.flaticon.com/512/2040/2040946.png', sortOrder: 4 },
  { name: 'Photo & Video', slug: 'photo-editing', iconUrl: 'https://cdn-icons-png.flaticon.com/512/1042/1042339.png', sortOrder: 5 },
  { name: 'Finance', slug: 'finance', iconUrl: 'https://cdn-icons-png.flaticon.com/512/2830/2830284.png', sortOrder: 6 },
  { name: 'VPN & Security', slug: 'vpn', iconUrl: 'https://cdn-icons-png.flaticon.com/512/2913/2913133.png', sortOrder: 7 },
  { name: 'Games', slug: 'games', iconUrl: 'https://cdn-icons-png.flaticon.com/512/1067/1067357.png', sortOrder: 8 },
];

// ---------------------------------------------------------------------------
// 2. APPS
// ---------------------------------------------------------------------------
const apps = [
  {
    name: 'Notion',
    slug: 'notion',
    searchCode: 'sm1',
    curiosityTitle: 'Ultimate Workspace Organizer Pro',
    shortDescription: 'All-in-one workspace for notes, docs, and tasks',
    longDescription:
      'Notion combines notes, tasks, wikis, and databases into a single connected workspace. Build custom pages for anything from personal journaling to full team project management, with flexible blocks that adapt to how you work.',
    developerName: 'Notion Labs, Inc.',
    packageName: 'notion.id',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=notion.id',
    iconUrl: 'https://play-lh.googleusercontent.com/2gnpMzn82hkHNGtHDdOSKp1F4rHfKfaFOAQBcheifJfyVDXhLpF-tsO5OuvxKcOKgpQ',
    priceType: 'freemium',
    playStoreRating: 4.5,
    categories: ['productivity'],
    features: ['Real-time sync across devices', 'Custom databases & templates', 'Offline mode', 'Team collaboration'],
    pros: ['Extremely flexible', 'Clean, minimal UI', 'Great templates community'],
    cons: ['Steep learning curve for beginners', 'Can feel slow with very large pages'],
    status: 'published',
    isNew: false,
    viewCount: 1240,
    favoriteCount: 88,
  },
  {
    name: 'ChatGPT',
    slug: 'chatgpt',
    searchCode: 'sm2',
    curiosityTitle: 'Advanced AI Chatbot Pro',
    shortDescription: 'AI assistant for writing, learning, and problem-solving',
    longDescription:
      'ChatGPT is a conversational AI assistant that can help you write, brainstorm, summarize, code, and answer questions across nearly any topic through natural conversation.',
    developerName: 'OpenAI',
    packageName: 'com.openai.chatgpt',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.openai.chatgpt',
    iconUrl: 'https://play-lh.googleusercontent.com/eBE1z8XZ0Uj6PgTgvNRnUR2lm-N-9AHW2GEP7f7ftGF7SPzuJZ9U9Fdlt2VpXVGBWA',
    priceType: 'freemium',
    playStoreRating: 4.7,
    categories: ['ai', 'productivity'],
    features: ['Natural language chat', 'Image understanding', 'Voice conversations', 'Custom GPTs'],
    pros: ['Extremely versatile', 'Fast responses', 'Regularly updated with new features'],
    cons: ['Free tier has usage limits', 'Can occasionally give inaccurate info'],
    status: 'published',
    isNew: false,
    viewCount: 3450,
    favoriteCount: 512,
  },
  {
    name: 'CapCut',
    slug: 'capcut',
    searchCode: 'sm3',
    curiosityTitle: 'Viral Video Studio Magic',
    shortDescription: 'Powerful free video editor for social media content',
    longDescription:
      'CapCut is a full-featured mobile video editor with templates, transitions, effects, auto-captions, and music, designed for creating short-form content for TikTok, Reels, and YouTube Shorts.',
    developerName: 'Bytedance Pte. Ltd',
    packageName: 'com.lemon.lvoverseas',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.lemon.lvoverseas',
    iconUrl: 'https://play-lh.googleusercontent.com/xVw6VeCF_zLnZk3lJEG3nDcqJyWKh1t8bDRp4ZQprnMDXsMprfeUW6mNYawgqDVGF8w',
    priceType: 'freemium',
    playStoreRating: 4.6,
    categories: ['photo-editing'],
    features: ['Auto captions', 'Templates & effects', 'Green screen', 'Speed & keyframe control'],
    pros: ['Free features rival paid editors', 'Huge template library', 'Easy for beginners'],
    cons: ['Watermark on some export options', 'Occasional ads'],
    status: 'published',
    isNew: false,
    viewCount: 2890,
    favoriteCount: 340,
  },
  {
    name: 'Duolingo',
    slug: 'duolingo',
    searchCode: 'sm4',
    curiosityTitle: 'Gamified Global Language Coach',
    shortDescription: 'Learn a new language in just a few minutes a day',
    longDescription:
      'Duolingo offers bite-sized, gamified lessons for over 40 languages, using streaks, XP, and leaderboards to keep learning consistent and engaging for all skill levels.',
    developerName: 'Duolingo',
    packageName: 'com.duolingo',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.duolingo',
    iconUrl: 'https://play-lh.googleusercontent.com/hSyebFXsjaMYPe_ArwALoBUawaSVW9DDX-DKUazVCV3rB0ETyOoVjmU1O7oOo6Fj4Q',
    priceType: 'freemium',
    playStoreRating: 4.7,
    categories: ['education'],
    features: ['40+ languages', 'Gamified streaks & XP', 'Speaking practice', 'Offline lessons'],
    pros: ['Fun and habit-forming', 'Completely usable for free', 'Good for absolute beginners'],
    cons: ['Not deep enough for fluency alone', 'Ads on free tier'],
    status: 'published',
    isNew: false,
    viewCount: 1980,
    favoriteCount: 210,
  },
  {
    name: 'CamScanner',
    slug: 'camscanner',
    searchCode: 'sm5',
    curiosityTitle: 'Portable AI Document Scanner',
    shortDescription: 'Turn your phone into a portable document scanner',
    longDescription:
      'CamScanner lets you scan documents, receipts, and whiteboards using your phone camera, then enhance, organize, and export them as searchable PDFs.',
    developerName: 'INTSIG Information Co.,Ltd',
    packageName: 'com.intsig.camscanner',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.intsig.camscanner',
    iconUrl: 'https://play-lh.googleusercontent.com/uz8xO1KWJyOgHW1RxwPUw4tK7pTB2mBydN2VofgHYCmvXscqjzokJXQqDLDpKhk4qw',
    priceType: 'freemium',
    playStoreRating: 4.5,
    categories: ['utilities', 'productivity'],
    features: ['PDF export', 'OCR text recognition', 'Cloud sync', 'Auto edge detection'],
    pros: ['Very accurate scanning', 'Fast OCR', 'Handles batch scans well'],
    cons: ['Subscription needed for full features', 'Frequent upgrade prompts'],
    status: 'published',
    isNew: false,
    viewCount: 870,
    favoriteCount: 65,
  },
  {
    name: 'Mint: Budget & Finance',
    slug: 'mint-budget-finance',
    searchCode: 'sm6',
    curiosityTitle: 'Smart Wealth & Budget Tracker',
    shortDescription: 'Track spending and manage your budget in one place',
    longDescription:
      'Mint connects to your bank accounts and credit cards to automatically track spending, categorize transactions, and help you build and stick to a monthly budget.',
    developerName: 'Intuit Inc.',
    packageName: 'com.mint',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.mint',
    iconUrl: 'https://play-lh.googleusercontent.com/4mLGdM4hlbn08KwlYBGTaKZ3vJmb2gsdQrQvLl0KFsW8sHOZOM9tHzS0d9NfXFOA3g',
    priceType: 'free',
    playStoreRating: 4.2,
    categories: ['finance'],
    features: ['Automatic transaction tracking', 'Custom budgets', 'Bill reminders', 'Credit score monitoring'],
    pros: ['Fully automated tracking', 'Free with no paywalled core features', 'Good visual breakdowns'],
    cons: ['Bank sync occasionally glitches', 'Ads for financial products'],
    status: 'published',
    isNew: false,
    viewCount: 640,
    favoriteCount: 41,
  },
  {
    name: 'ProtonVPN',
    slug: 'protonvpn',
    searchCode: 'sm7',
    curiosityTitle: 'Secure Zero-Logs Swiss Tunnel',
    shortDescription: 'Secure, no-logs VPN for private browsing',
    longDescription:
      'ProtonVPN encrypts your internet connection and hides your IP address, built by the team behind Proton Mail with a strict no-logs policy and open-source apps.',
    developerName: 'Proton AG',
    packageName: 'ch.protonvpn.android',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=ch.protonvpn.android',
    iconUrl: 'https://play-lh.googleusercontent.com/2WSJfPYRw3ZFXJJgAWiZ0P9F1jKM6JZeJlTC5EQ35Wl4NfvSHwXR9YQ4mHnBaLLPZg',
    priceType: 'freemium',
    playStoreRating: 4.4,
    categories: ['vpn'],
    features: ['No-logs policy', 'Free unlimited tier', 'Kill switch', 'Open-source apps'],
    pros: ['Free tier has no data cap', 'Strong privacy reputation', 'Easy one-tap connect'],
    cons: ['Free servers can be slower', 'Fewer server locations on free plan'],
    status: 'published',
    isNew: true,
    viewCount: 410,
    favoriteCount: 33,
  },
  {
    name: 'Subway Surfers',
    slug: 'subway-surfers',
    searchCode: 'sm8',
    curiosityTitle: 'Endless Train Track Runner 3D',
    shortDescription: 'Endless runner dodging trains with your crew',
    longDescription:
      'Subway Surfers is a fast-paced endless runner where you dash through train tracks, dodge obstacles, and collect coins to unlock characters, boards, and power-ups.',
    developerName: 'SYBO Games',
    packageName: 'com.kiloo.subwaysurf',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.kiloo.subwaysurf',
    iconUrl: 'https://play-lh.googleusercontent.com/aJnBjfsCbyxHzod-U2SttbYQBFRR1UO8ZKA5EutWKGtWWZDGpqp0k1QqbT5FmY3z8w',
    priceType: 'free',
    playStoreRating: 4.5,
    categories: ['games'],
    features: ['Endless runner gameplay', 'Weekly hunts & events', 'Character & board unlocks', 'Offline play'],
    pros: ['Simple, addictive gameplay', 'Frequent content updates', 'Works offline'],
    cons: ['Frequent ads', 'Progression can push in-app purchases'],
    status: 'published',
    isNew: false,
    viewCount: 1560,
    favoriteCount: 190,
  },
  {
    name: 'Remini - AI Photo Enhancer',
    slug: 'remini',
    searchCode: 'sm9',
    curiosityTitle: 'HD Photo Restoration & Enhancer AI',
    shortDescription: 'Enhance and restore old or blurry photos with AI',
    longDescription:
      'Remini uses AI to sharpen, restore, and enhance blurry, low-quality, or old photos, and can generate high-definition portraits from selfies.',
    developerName: 'Bending Spoons',
    packageName: 'com.bpmobile.iprettyup',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.bpmobile.iprettyup',
    iconUrl: 'https://play-lh.googleusercontent.com/4dwqO-6cKgeqUHc5X0Wta2tS1SVsc5oXATVXQqQjNsWLqLOu0Ol5NEZmYQqNwEjK9A',
    priceType: 'freemium',
    playStoreRating: 4.3,
    categories: ['ai', 'photo-editing'],
    features: ['AI face enhancement', 'Old photo restoration', 'Video enhancement', 'HD upscaling'],
    pros: ['Impressive restoration quality', 'Fast processing', 'Fun AI avatar features'],
    cons: ['Subscription required for full use', 'Can over-smooth some faces'],
    status: 'published',
    isNew: true,
    viewCount: 980,
    favoriteCount: 120,
  },
  {
    name: 'Todoist',
    slug: 'todoist',
    searchCode: 'sm10',
    curiosityTitle: 'Simple Task Master Elite',
    shortDescription: 'Organize tasks and projects with a simple to-do list',
    longDescription:
      'Todoist helps you capture tasks, organize them into projects, set recurring reminders, and track productivity trends, syncing seamlessly across all your devices.',
    developerName: 'Doist Inc.',
    packageName: 'com.todoist',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.todoist',
    iconUrl: 'https://play-lh.googleusercontent.com/qEsBK8dbo1ZAGGeXm7hLtNiEsA_ry5ohbupO1U9SDIQVwPYPXAyQXYPvKOtptJvJm2M',
    priceType: 'freemium',
    playStoreRating: 4.6,
    categories: ['productivity'],
    features: ['Recurring reminders', 'Project organization', 'Cross-device sync', 'Productivity tracking'],
    pros: ['Clean and fast interface', 'Reliable notifications', 'Great free tier'],
    cons: ['Advanced features need Pro plan', 'No built-in calendar view on free tier'],
    status: 'published',
    isNew: false,
    viewCount: 730,
    favoriteCount: 95,
  },
];

// ---------------------------------------------------------------------------
// SEED LOGIC
// ---------------------------------------------------------------------------
async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB:', MONGODB_URI);

    // The project previously identified reviews by userId. MongoDB preserves
    // indexes after deleteMany(), so remove that legacy index before seeding
    // reviews identified by deviceId.
    try {
      await Review.collection.dropIndex('appId_1_userId_1');
      console.log('Removed legacy reviews index: appId_1_userId_1');
    } catch (error) {
      if (error.codeName !== 'IndexNotFound') throw error;
    }

    // Clear existing data (safe for dev only — never run against production)
    await Promise.all([
      Admin.deleteMany({}),
      Category.deleteMany({}),
      App.deleteMany({}),
      Review.deleteMany({}),
      Favorite.deleteMany({}),
      RecentlyViewed.deleteMany({}),
      DailyFeatured.deleteMany({}),
      Notification.deleteMany({}),
      Device.deleteMany({}),
    ]);
    console.log('Cleared existing collections');

    // 1. Admins
    const passwordHash = await bcrypt.hash('Admin@123', 10);
    const admins = await Admin.insertMany([
      { name: 'Ahmed (Owner)', email: 'admin@maktech.app', passwordHash, isActive: true },
      { name: 'Sara (Editor)', email: 'sara@maktech.app', passwordHash, isActive: true },
    ]);
    console.log(`Seeded ${admins.length} admins (password for both: Admin@123)`);

    // 2. Categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`Seeded ${createdCategories.length} categories`);

    // 3. Apps
    const appsWithCreator = apps.map((a) => ({
      ...a,
      createdBy: admins[0]._id,
      updatedBy: admins[0]._id,
    }));
    const createdApps = await App.insertMany(appsWithCreator);
    console.log(`Seeded ${createdApps.length} apps`);

    // 4. Sample devices
    const devices = await Device.insertMany([
      { deviceId: 'device-demo-001', platform: 'android', fcmToken: null },
      { deviceId: 'device-demo-002', platform: 'ios', fcmToken: null },
    ]);
    console.log(`Seeded ${devices.length} sample devices`);

    // 5. Reviews (also drives ratingStats)
    const reviewSeed = [
      { app: 'notion', deviceId: devices[0].deviceId, rating: 5, comment: 'Replaced 3 other apps for me.' },
      { app: 'notion', deviceId: devices[1].deviceId, rating: 4, comment: 'Great but took time to learn.' },
      { app: 'chatgpt', deviceId: devices[0].deviceId, rating: 5, comment: 'Use it daily for work.' },
      { app: 'capcut', deviceId: devices[1].deviceId, rating: 5, comment: 'Best free editor on mobile.' },
      { app: 'duolingo', deviceId: devices[0].deviceId, rating: 4, comment: 'Fun way to build a habit.' },
    ];

    for (const r of reviewSeed) {
      const app = createdApps.find((a) => a.slug === r.app);
      await Review.create({
        appId: app._id,
        deviceId: r.deviceId,
        rating: r.rating,
        comment: r.comment,
      });
    }

    // Recalculate ratingStats per app from seeded reviews
    for (const app of createdApps) {
      const stats = await Review.aggregate([
        { $match: { appId: app._id } },
        { $group: { _id: '$appId', average: { $avg: '$rating' }, count: { $sum: 1 } } },
      ]);
      if (stats.length) {
        await App.findByIdAndUpdate(app._id, {
          ratingStats: { average: Math.round(stats[0].average * 10) / 10, count: stats[0].count },
        });
      }
    }
    console.log('Seeded reviews and recalculated ratingStats');

    // 6. Favorites
    const notion = createdApps.find((a) => a.slug === 'notion');
    const chatgpt = createdApps.find((a) => a.slug === 'chatgpt');
    await Favorite.insertMany([
      { deviceId: devices[0].deviceId, appId: notion._id },
      { deviceId: devices[0].deviceId, appId: chatgpt._id },
      { deviceId: devices[1].deviceId, appId: chatgpt._id },
    ]);
    await App.findByIdAndUpdate(notion._id, { $inc: { favoriteCount: 0 } }); // counts already set above
    console.log('Seeded favorites');

    // 7. Recently viewed
    await RecentlyViewed.insertMany([
      { deviceId: devices[0].deviceId, appId: notion._id, viewedAt: new Date() },
      { deviceId: devices[0].deviceId, appId: chatgpt._id, viewedAt: new Date() },
    ]);
    console.log('Seeded recently viewed');

    // 8. Daily featured (today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await DailyFeatured.create({
      appId: chatgpt._id,
      featuredDate: today,
      createdBy: admins[0]._id,
    });
    console.log('Seeded today\'s featured app: ChatGPT');

    // 9. A sample notification
    const remini = createdApps.find((a) => a.slug === 'remini');
    const notif = await Notification.create({
      title: 'New app added!',
      body: 'Remini - AI Photo Enhancer just landed. Check it out.',
      appId: remini._id,
      type: 'new_app',
      sentBy: admins[0]._id,
    });
    console.log('Seeded a sample notification:', notif.title);

    console.log('\n✅ Seed complete.');
    console.log(`   Admin login: admin@maktech.app / Admin@123`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
