import { AppItem } from '../types';

export const CURATED_APPS: AppItem[] = [
  {
    id: 'gemini',
    name: 'Gemini',
    developer: 'Google LLC',
    category: 'AI',
    rating: 4.6,
    ratingCount: '1.2M',
    description: 'Google\'s official AI assistant to help you write, plan, learn, and brainstorm directly on your phone.',
    longDescription: 'Gemini is your direct access to Google\'s most capable AI models. Designed as a personal assistant, it helps you draft emails, analyze code, write creative copy, plan trips, and understand complex topics using natural language. It integrates natively with Google Workspace apps and provides voice activation and real-time image analysis.',
    downloadUrl: 'https://play.google.com/store/apps/details?id=com.google.android.apps.bard',
    iconUrl: 'Sparkles',
    iconColor: 'from-blue-500 via-purple-500 to-pink-500',
    features: [
      'Voice-activated helper: Hold down the power button to summon Gemini',
      'Workspace integrations: Bring context from Gmail, Docs, and Google Drive',
      'Multimodal intelligence: Upload images and ask questions about them in real-time',
      'Creative brain: Write emails, essays, poems, and code snippets instantly',
      'Search Grounding: Real-time search integration to get the latest accurate info'
    ],
    advantages: [
      'Extremely fast response times',
      'Seamless integration with Google ecosystem (Drive, YouTube, Maps)',
      'Free access to advanced model capabilities'
    ],
    disadvantages: [
      'May occasionally produce hallucinations on obscure facts',
      'Requires a constant, strong internet connection',
      'Can be invasive with background permissions if voice activation is on'
    ],
    screenshots: [
      {
        title: 'Chat Screen',
        type: 'chat',
        content: 'AI Assistant: Hello! How can I help you today?\nUser: Can you draft a responsive React component?\nAI Assistant: Here is a custom clean component...',
        accentColor: '#3b82f6'
      },
      {
        title: 'Workspace Plugin',
        type: 'feature_list',
        content: '🔗 Google Drive Enabled\n🔗 Google Maps Enabled\n🔗 YouTube search Enabled\n🔗 Gmail access Enabled',
        accentColor: '#8b5cf6'
      },
      {
        title: 'Image Analysis',
        type: 'custom',
        content: '📷 Image: [Golden Gate Bridge]\nQuery: "Why was this painted orange?"\nResponse: "International Orange was chosen to increase visibility in dense fog and blend with the natural surroundings."',
        accentColor: '#ec4899'
      }
    ],
    reviews: [
      {
        id: 'r1',
        username: 'Alex Carter',
        rating: 5,
        date: '2026-06-20',
        comment: 'This has completely replaced Google Assistant for me. It is incredibly smart and understands follow-up questions perfectly.'
      },
      {
        id: 'r2',
        username: 'Sarah Jenkins',
        rating: 4,
        date: '2026-07-01',
        comment: 'Integration with Google Drive is a game-changer. I can ask questions about my PDFs directly. Sometimes it takes a second to load, but it works!'
      },
      {
        id: 'r3',
        username: 'Devon Wright',
        rating: 4,
        date: '2026-07-12',
        comment: 'Very helpful for quick code debugging, though you still need to verify the code manually. Solid 4 stars!'
      }
    ],
    isTrending: true,
    isDailyFeatured: true
  },
  {
    id: 'notion',
    name: 'Notion',
    developer: 'Notion Labs, Inc.',
    category: 'Productivity',
    rating: 4.5,
    ratingCount: '450K',
    description: 'The all-in-one workspace for your notes, tasks, wikis, projects, and highly customized databases.',
    longDescription: 'Notion is a highly modular note-taking and project management tool that lets you build your own workspace. Use custom tables, kanban boards, calendars, and checklists to organize anything from personal habit trackers to company-wide product roadmaps. It syncs instantly across devices and allows powerful collaborative editing.',
    downloadUrl: 'https://play.google.com/store/apps/details?id=notion.id',
    iconUrl: 'FileText',
    iconColor: 'from-gray-700 to-gray-900',
    features: [
      'Modular building blocks: Create pages with toggle lists, headers, and code snippets',
      'Advanced relational databases with custom properties and rollups',
      'Clean kanban boards, timelines, and calendar views for project tracking',
      'Real-time team collaboration with comments, @mentions, and notifications',
      'Offline caching for reading and quick edits on the go'
    ],
    advantages: [
      'Almost infinite customization options to fit your exact workflow',
      'Clean, minimalist, distraction-free aesthetic',
      'Extremely generous free tier for personal use'
    ],
    disadvantages: [
      'Steep learning curve for databases and complex integrations',
      'Mobile app can be slow to cold-start on older Android devices',
      'Offline mode is still somewhat limited compared to dedicated local notes'
    ],
    screenshots: [
      {
        title: 'Personal Home',
        type: 'dashboard',
        content: '🏡 Personal Workspace\n- 📝 Daily Journal\n- 🎯 Goals & Habits\n- 📚 Reading List\n- ✈️ Travel Planner',
        accentColor: '#1f2937'
      },
      {
        title: 'Task Board',
        type: 'stats',
        content: '[Kanban Board]\nTo Do: (3) Review mockups, Gym\nIn Progress: (1) App design\nCompleted: (12) Launch beta v1',
        accentColor: '#10b981'
      }
    ],
    reviews: [
      {
        id: 'n1',
        username: 'Marcus Aurelius',
        rating: 5,
        date: '2026-05-15',
        comment: 'I run my entire life on Notion. From journaling to my daily task board. The level of customization is unmatched.'
      },
      {
        id: 'n2',
        username: 'Clara Oswald',
        rating: 4,
        date: '2026-06-11',
        comment: 'Excellent on desktop, but the mobile version takes about 4 seconds to load. Still, the database synching is amazing.'
      }
    ],
    isTrending: true,
    isNew: false
  },
  {
    id: 'duolingo',
    name: 'Duolingo',
    developer: 'Duolingo',
    category: 'Education',
    rating: 4.7,
    ratingCount: '15M',
    description: 'Learn Spanish, French, German, Japanese, and more through quick, bite-sized gamified lessons.',
    longDescription: 'Duolingo makes language learning fun and addictive. With bite-sized lessons, interactive challenges, and friendly characters, you develop solid reading, writing, listening, and speaking skills. Its gamified streak mechanics encourage daily practice, while personalized algorithms help you review words at the perfect time.',
    downloadUrl: 'https://play.google.com/store/apps/details?id=com.duolingo',
    iconUrl: 'GraduationCap',
    iconColor: 'from-green-400 to-green-600',
    features: [
      '40+ languages available to learn completely for free',
      'Gamified progress tracker with streaks, leagues, and reward gems',
      'Interactive speech recognition engine to perfect your pronunciation',
      'Adaptive spacing repetition tailored to your common mistakes',
      'Offline learning modules for active Duolingo Super subscribers'
    ],
    advantages: [
      'Incredibly engaging and gamified - makes daily practice effortless',
      'Teaches practical reading, listening, and conversational speaking',
      'Completely free with non-intrusive ad banners'
    ],
    disadvantages: [
      'Streaks can create anxiety or habit exhaustion for some users',
      'Does not go deeply into complex grammatical rule explanations',
      'Ad frequency can be distracting on the free tier'
    ],
    screenshots: [
      {
        title: 'Language Map',
        type: 'map',
        content: '🌟 Unit 1: Order Food & Drinks\n🟢 Lesson 1: Café & Croissant\n🟢 Lesson 2: Asking for the bill\n🔒 Unit 2: Directions in town',
        accentColor: '#22c55e'
      },
      {
        title: 'Streak Multiplier',
        type: 'stats',
        content: '🔥 154 Days Streak!\n"Keep Duo happy, do your daily 5-minute drill!"\n⚡️ Daily XP: 45 / 50',
        accentColor: '#f59e0b'
      }
    ],
    reviews: [
      {
        id: 'd1',
        username: 'Emma Stone',
        rating: 5,
        date: '2026-06-25',
        comment: 'I have been on a 300-day Spanish streak! It is genuinely fun and I can actually read menu boards now when traveling.'
      },
      {
        id: 'd2',
        username: 'Liam Neeson',
        rating: 4,
        date: '2026-07-05',
        comment: 'Great app for beginners. It won\'t make you fluent overnight, but it gets you started with vocabulary in a super friendly way.'
      }
    ],
    isTrending: false,
    isNew: false
  },
  {
    id: 'snapseed',
    name: 'Snapseed',
    developer: 'Google LLC',
    category: 'Photo Editing',
    rating: 4.4,
    ratingCount: '1.5M',
    description: 'A complete and professional-grade photo editor developed by Google, featuring 29 professional tools.',
    longDescription: 'Snapseed is a professional photo editing app that gives you high-end tools on a simple swipe interface. It supports RAW DNG files, selective brush tuning, double exposures, smart healing, perspective corrections, and a wide array of curated vintage and cinematic filters. It is completely ad-free and offers total control over fine details.',
    downloadUrl: 'https://play.google.com/store/apps/details?id=com.niksoftware.snapseed',
    iconUrl: 'Camera',
    iconColor: 'from-teal-400 to-emerald-600',
    features: [
      '29 powerful editing tools including Healing, Brush, Structure, and HDR',
      'RAW develop support: Open and tweak native RAW files from your camera',
      'Selective Filter Brush: Edit only specific areas of your photograph',
      'Save your custom looks as presets to apply them to future photos instantly',
      'Smart Perspective correction: Automatically fill empty edges when rotating'
    ],
    advantages: [
      'Completely free with zero ads, subscriptions, or watermarks',
      'Professional-grade precision controls (Curves, White Balance, RAW)',
      'Extremely clean, gesture-driven user interface'
    ],
    disadvantages: [
      'Infrequent feature updates in recent years',
      'Steep learning curve for selective masks and curves control',
      'No desktop synchronization or cloud gallery integration'
    ],
    screenshots: [
      {
        title: 'Editing Panel',
        type: 'editor',
        content: '🎛️ Tools:\n[ Tune Image ] [ Details ] [ Curves ]\n[ Healing ] [ Brush ] [ Double Exposure ]\n📐 Swipe to adjust brightness: +15%',
        accentColor: '#10b981'
      }
    ],
    reviews: [
      {
        id: 's1',
        username: 'Julian R.',
        rating: 5,
        date: '2026-04-18',
        comment: 'Unbelievable that this app is entirely free. The healing brush works magically. Perfect for quick edits on travel photos.'
      },
      {
        id: 's2',
        username: 'Nadia K.',
        rating: 5,
        date: '2026-05-30',
        comment: 'Best RAW developer for mobile. White balance adjustments are incredibly precise. No subscriptions is a massive relief.'
      }
    ],
    isTrending: true,
    isNew: false
  },
  {
    id: 'protonvpn',
    name: 'Proton VPN',
    developer: 'Proton AG',
    category: 'VPN',
    rating: 4.6,
    ratingCount: '320K',
    description: 'Secure, private, and high-speed Swiss VPN that respects user privacy with a strict zero-logs policy.',
    longDescription: 'Created by the scientists behind Proton Mail, Proton VPN provides secure, encrypted internet access. It features advanced security protocols, bypasses geo-restrictions, and hides your IP address. Crucially, its free tier has no data caps, no ads, and does not sell your browsing history, operating under strict Swiss privacy laws.',
    downloadUrl: 'https://play.google.com/store/apps/details?id=ch.protonvpn.android',
    iconUrl: 'Shield',
    iconColor: 'from-indigo-600 to-purple-800',
    features: [
      'Strict Swiss privacy: Secure core server architecture under Swiss jurisdiction',
      'Uncapped free tier: Enjoy unlimited bandwidth with zero intrusive ads',
      'NetShield DNS Filter: Block dangerous malware, tracker cookies, and scripts',
      'Double hop VPN: Route traffic through multiple server nodes for absolute privacy',
      'Tor over VPN: Seamless integration with the Tor anonymity network'
    ],
    advantages: [
      'Genuinely unlimited data usage on the free tier',
      'Open-source and independently audited codebases',
      'Excellent speeds and robust security protocols (WireGuard)'
    ],
    disadvantages: [
      'Free tier is restricted to 3 server countries (US, NL, JP)',
      'Streaming platform unlock requires the Premium plan',
      'Can increase battery drain when running persistently in background'
    ],
    screenshots: [
      {
        title: 'Secure Connection',
        type: 'stats',
        content: '🔒 Proton VPN: ACTIVE\nIP: 185.159.157.4\nCountry: Switzerland (Geneva)\nProtocol: WireGuard\nSpeed: 84.5 Mbps ↓ / 21.2 Mbps ↑',
        accentColor: '#6366f1'
      }
    ],
    reviews: [
      {
        id: 'pv1',
        username: 'Dave Miller',
        rating: 5,
        date: '2026-07-02',
        comment: 'The only free VPN that I actually trust. No ads, unlimited data, and from a highly reputable security company.'
      },
      {
        id: 'pv2',
        username: 'Elena Rostova',
        rating: 4,
        date: '2026-07-10',
        comment: 'Speeds are very good. Only complaint is that the free tier chooses the country automatically, but still incredible value.'
      }
    ],
    isTrending: false,
    isNew: true
  },
  {
    id: 'yotta',
    name: 'Yotta',
    developer: 'Yotta Technologies',
    category: 'Finance',
    rating: 4.3,
    ratingCount: '45K',
    description: 'A smart FDIC-insured savings app that awards tickets for daily prize drawings up to $1 million.',
    longDescription: 'Yotta reward systems turn saving money into a gamified, exciting habit. For every $25 you deposit, you earn a recurring ticket into daily sweeps drawings. Prizes range from 10 cents to a life-changing $1,000,000. Funds are held with FDIC-insured partner banks, giving you high-yield returns combined with the fun of lottery-style rewards.',
    downloadUrl: 'https://play.google.com/store/apps/details?id=com.yottasalvations',
    iconUrl: 'TrendingUp',
    iconColor: 'from-blue-600 to-indigo-500',
    features: [
      'Daily prize draws at 9 PM EST for cash rewards up to $1 Million',
      'FDIC-insured savings up to $250,000 through partner institutions',
      'Debit Card bonuses: Stand a 1 in 150 chance to get your purchase paid for free',
      'Customizable automated deposits to compound tickets passively',
      'High contrast spending charts and instant budget categorizations'
    ],
    advantages: [
      'Significantly more fun than a boring, static savings account',
      'Funds are fully secured and insured up to legal limits',
      'No monthly maintenance fees or account minimums'
    ],
    disadvantages: [
      'Daily prize payouts fluctuate depending on statistical luck',
      'Not a full replacement for a traditional check-writing checking account',
      'Only available to residents of the United States'
    ],
    screenshots: [
      {
        title: 'Sweeps Tickets',
        type: 'stats',
        content: '🎟️ Your Active Tickets: 142\nTonight\'s numbers: [ 12 ] [ 24 ] [ 36 ] [ 52 ] [ 09 ]\nYour matching cash win last night: $4.50\nTotal Savings: $3,550.00',
        accentColor: '#2563eb'
      }
    ],
    reviews: [
      {
        id: 'y1',
        username: 'Preston T.',
        rating: 5,
        date: '2026-05-18',
        comment: 'I saved more in 6 months using Yotta than I did in 3 years with my local bank. Winning small cash prizes keeps me super motivated.'
      },
      {
        id: 'y2',
        username: 'Megan G.',
        rating: 4,
        date: '2026-06-22',
        comment: 'Great interface and concept. I\'ve won about $25 in prizes so far. Takes a few days to transfer money back out, which is standard.'
      }
    ],
    isTrending: false,
    isNew: true
  },
  {
    id: 'phind',
    name: 'Phind',
    developer: 'Phind Inc.',
    category: 'AI',
    rating: 4.8,
    ratingCount: '15K',
    description: 'An AI search engine and code assistant designed specifically for programmers and developers.',
    longDescription: 'Phind is an intelligent search engine that answers technical queries immediately. It filters out fluff, searches the live web for documentation, synthesizes developer tutorials, and writes clean code snippets with explanations. It provides robust support for multiple programming languages and framework setups, serving as an on-demand programming pair partner.',
    downloadUrl: 'https://play.google.com/store/apps/details?id=com.phind.app',
    iconUrl: 'Code',
    iconColor: 'from-cyan-500 to-sky-700',
    features: [
      'Instant synthesized answers complete with step-by-step code segments',
      'Live web indexing: Always reads the newest documentation and API versions',
      'Customizable filters: Focus searches strictly on Rust, TS, Python, or Web Dev',
      'Full conversation history saving with code snippet export options',
      'Direct link references: Check original blog posts or GitHub files'
    ],
    advantages: [
      'Cuts down standard programming search loops from 15 minutes to 15 seconds',
      'Rarely produces outdated syntax due to live-search indexing',
      'Completely free with optional premium tiers for custom heavy agents'
    ],
    disadvantages: [
      'Strictly technical - not suited for general personal daily tasks',
      'Interface is highly optimized for developers, which can look complex to beginners',
      'Cannot perform direct hardware controls or run background local compilers'
    ],
    screenshots: [
      {
        title: 'Developer Answer',
        type: 'chat',
        content: 'Query: "How to run esbuild with TS?"\nAnswer: Use: esbuild server.ts --bundle --platform=node\n[Code Block: typescript]\nimport * as esbuild from "esbuild";\n...\nReferences: esbuild.github.io, StackOverflow',
        accentColor: '#06b6d4'
      }
    ],
    reviews: [
      {
        id: 'ph1',
        username: 'Jordan Miller',
        rating: 5,
        date: '2026-06-15',
        comment: 'This is an absolute lifesaver. It is like StackOverflow on steroids. Saves me hours of searching for correct API docs.'
      },
      {
        id: 'ph2',
        username: 'Maya Lin',
        rating: 5,
        date: '2026-07-09',
        comment: 'Live web indexing means it knows about React 19 and the newest frameworks. Standard models usually fail here.'
      }
    ],
    isTrending: true,
    isNew: true
  },
  {
    id: 'ankidroid',
    name: 'AnkiDroid',
    developer: 'AnkiDroid Open Source',
    category: 'Education',
    rating: 4.7,
    ratingCount: '180K',
    description: 'Powerful, community-driven flashcard app utilizing spaced repetition to memorize anything efficiently.',
    longDescription: 'AnkiDroid is an open-source companion app for Anki, the gold-standard spaced repetition flashcard program. It allows you to study vocabularies, prepare for medical or legal board exams, or memorize names and formulas. It uses scientific intervals to show cards right before you would naturally forget them, making long-term memory retrieval incredibly strong.',
    downloadUrl: 'https://play.google.com/store/apps/details?id=com.ichi2.anki',
    iconUrl: 'Layers',
    iconColor: 'from-blue-700 to-sky-900',
    features: [
      'Spaced Repetition Algorithm: Scientific intervals optimize memory retention',
      'Import thousands of free pre-made decks from the Anki Shared web library',
      'Full synchronization across Windows, Mac, Linux, iOS, and Web',
      'Rich media support: Embed audio recordings, images, and LaTeX formulas',
      'Extremely detailed study statistics and progress charts'
    ],
    advantages: [
      '100% free, open-source, and contains zero advertising trackers',
      'Unbelievably efficient for heavy learning (Medical school, Japanese Kanji)',
      'Highly customizable card templates and styles'
    ],
    disadvantages: [
      'Extremely basic, 2010s-style visual interface out of the box',
      'Steep configuration curve to create custom card types and template scripts',
      'Requires manually synching with AnkiWeb accounts'
    ],
    screenshots: [
      {
        title: 'Study Card',
        type: 'feature_list',
        content: '📚 Japanese N3 Vocab\nFront: 明るい\n[Show Answer]\nBack: あかるい (akarui) - Bright; cheerful\nButtons: [Again (1m)] [Good (1d)] [Easy (4d)]',
        accentColor: '#1d4ed8'
      }
    ],
    reviews: [
      {
        id: 'a1',
        username: 'Kenji S.',
        rating: 5,
        date: '2026-05-14',
        comment: 'Passes my language exam thanks to this. It looks old, but the math behind the spaced repetition is absolute science.'
      }
    ],
    isTrending: false,
    isNew: false
  },
  {
    id: 'forest',
    name: 'Forest',
    developer: 'Seekrtech',
    category: 'Productivity',
    rating: 4.6,
    ratingCount: '410K',
    description: 'Stay focused on your real-life tasks by planting virtual seeds that grow into mature trees as you work.',
    longDescription: 'Forest is an award-winning gamified focus timer. Whenever you need to put down your phone, plant a seed. Over the next 25 minutes, this seed will grow into a mature tree. However, if you leave the app to check social media or play games, your tree will instantly wither. Compete with friends and grow a lush forest representing your hard work.',
    downloadUrl: 'https://play.google.com/store/apps/details?id=cc.forestapp',
    iconUrl: 'Leaf',
    iconColor: 'from-emerald-500 to-green-700',
    features: [
      'Gamified Focus Timer: Grow 30+ custom tree and shrub species',
      'Real-world impact: Earn virtual coins to plant real trees on Earth',
      'Focus categories: Label sessions as Work, Study, Social, or Exercise',
      'Detailed timeline: Track exactly when and where you focused during the week',
      'App whitelist: Block addictive apps while allowing vital calls and tools'
    ],
    advantages: [
      'Highly visual psychological incentive - nobody wants to kill a cute tree',
      'Partners with "Trees for the Future" to plant real trees (over 1M planted!)',
      'Beautiful audio soundscapes like Rain, Forest, and Café included'
    ],
    disadvantages: [
      'Some custom trees and soundscapes require coins locked behind in-app purchases',
      'Whitelist controls require extensive Android accessibility permissions',
      'Can be bypassed if you turn off the "stop growing" penalty settings'
    ],
    screenshots: [
      {
        title: 'Focus Garden',
        type: 'dashboard',
        content: '🌳 Active Focus Timer: 18:45\n🌲 Growing: Blue Spruce\n"Stay focused! Do not look at your Instagram feed!"\n[ Give Up (Withers Tree) ]',
        accentColor: '#10b981'
      }
    ],
    reviews: [
      {
        id: 'fo1',
        username: 'Arthur Pendragon',
        rating: 5,
        date: '2026-07-01',
        comment: 'This is the only focus technique that works for me. Caring for the virtual tree triggers just enough responsibility to keep me off TikTok.'
      }
    ],
    isTrending: true,
    isNew: false
  },
  {
    id: 'solidexplorer',
    name: 'Solid Explorer',
    developer: 'NeatBytes',
    category: 'Utilities',
    rating: 4.5,
    ratingCount: '150K',
    description: 'A gorgeous, powerful, and intuitive dual-pane file explorer and cloud manager for advanced Android users.',
    longDescription: 'Solid Explorer is a premium file manager inspired by old-school dual-pane commanders. It features a rich Material Design interface, robust encryption controls, cloud storage integration (Drive, Dropbox, OneDrive), and advanced network sharing support (FTP, SFTP, WebDav). Perfect for managing local device files, server folders, and compressed archives.',
    downloadUrl: 'https://play.google.com/store/apps/details?id=pl.solidexplorer2',
    iconUrl: 'FolderOpen',
    iconColor: 'from-amber-500 to-amber-700',
    features: [
      'Dual-Pane Layout: Drag and drop files easily between two independent directories',
      'Strong Encryption: Protect folder archives with master passwords and fingerprints',
      'Cloud Manager: Manage files on Google Drive, Dropbox, Box, and Mega in one list',
      'Built-in media players, image viewers, and text code editors',
      'Root Explorer: Advanced access to system directories for modded devices'
    ],
    advantages: [
      'Stunning, modern material design with fluid transition animations',
      'Extremely fast searching and file indexing capabilities',
      'One-time purchase license with zero advertising adware'
    ],
    disadvantages: [
      'Only offers a 14-day free trial, after which a minor payment is required',
      'Slightly higher battery usage during massive cloud-sync transfers',
      'Menu system can feel slightly cluttered due to extensive features'
    ],
    screenshots: [
      {
        title: 'Dual Pane',
        type: 'dashboard',
        content: '📂 Left Pane: /sdcard/Downloads\n- 📝 resume.pdf\n- 📦 server_backup.zip\n\n📂 Right Pane: /Cloud/Google Drive\n- 📁 Projects_2026',
        accentColor: '#f59e0b'
      }
    ],
    reviews: [
      {
        id: 'se1',
        username: 'Gilles M.',
        rating: 5,
        date: '2026-06-18',
        comment: 'Worth every single penny. Dual-pane drag and drop makes organizing documents a breeze. Absolutely no junk adware like other file managers.'
      }
    ],
    isTrending: false,
    isNew: false
  },
  {
    id: 'brave',
    name: 'Brave Browser',
    developer: 'Brave Software',
    category: 'Utilities',
    rating: 4.6,
    ratingCount: '4.5M',
    description: 'A privacy-first web browser with a built-in ad blocker, tracker blocker, and HTTPS upgrade engine.',
    longDescription: 'Brave is a chromium-based browser designed to protect your privacy and speed up your web browsing. It automatically blocks ads, popups, and tracker scripts right out of the box, saving you data and battery. It includes a built-in VPN, private Tor tabs, and an optional rewards system that compensates you in utility tokens for viewing privacy-respecting ads.',
    downloadUrl: 'https://play.google.com/store/apps/details?id=com.brave.browser',
    iconUrl: 'Globe',
    iconColor: 'from-orange-500 to-red-600',
    features: [
      'Brave Shields: Blocks advertisements, cookies, trackers, and fingerprinting',
      'Up to 3x faster page load speeds compared to standard browsers',
      'Saves data and battery life by stopping heavy background analytical script loads',
      'Built-in secure Brave Playlist: Play videos and music offline without interruptions',
      'Sync bookmarks, passwords, and histories securely across all platforms'
    ],
    advantages: [
      'Incredible speed improvement - sites feel instantly responsive',
      'Ad-blocker works perfectly on major video platforms without workarounds',
      'Open-source and privacy-focused business model'
    ],
    disadvantages: [
      'Cryptocurrency integration (Brave Rewards) can feel bloat-like to some users',
      'Some websites may break slightly until you toggle shields down temporarily',
      'Bookmarks synchronization setup uses a secure sync chain which can be finicky'
    ],
    screenshots: [
      {
        title: 'Brave Shields',
        type: 'stats',
        content: '🦁 Brave Shield Active:\n🚫 Ads & Trackers Blocked: 12,482\n📉 Data Saved: 450 MB\n⏱️ Est. Time Saved: 15 minutes\n🔒 Connection Secured: HTTPS Only',
        accentColor: '#ea580c'
      }
    ],
    reviews: [
      {
        id: 'br1',
        username: 'Nathan Drake',
        rating: 5,
        date: '2026-07-11',
        comment: 'I can browse web pages without getting bombed by popups and overlay banners. Absolute must-have on any mobile device.'
      }
    ],
    isTrending: true,
    isNew: false
  },
  {
    id: 'retroarch',
    name: 'RetroArch',
    developer: 'Libretro',
    category: 'Games',
    rating: 4.1,
    ratingCount: '90K',
    description: 'The ultimate open-source modular frontend for game emulators, retro engines, and media players.',
    longDescription: 'RetroArch is a modular game system that lets you play classic games on your Android device. It uses a clean console-like interface to run "cores"—virtual packages of historical emulators (NES, SNES, Genesis, PS1, GBA). It supports modern physical Bluetooth controllers, automated save-stating, cheats, netplay multiplayer, and advanced CRT-style visual shaders.',
    downloadUrl: 'https://play.google.com/store/apps/details?id=com.retroarch',
    iconUrl: 'Gamepad2',
    iconColor: 'from-purple-600 to-indigo-900',
    features: [
      'Modular cores: Download and update emulators directly from the frontend menu',
      'Advanced controller mapping: Plug and play Xbox, PlayStation, and 8BitDo gamepads',
      'Real-time Savestates: Save and load your game progress anywhere, instantly',
      'Shaders and Overlays: Emulate old-school cathode-ray tube (CRT) scanlines',
      'Netplay: Play multiplayer retro games with friends over local Wi-Fi or internet'
    ],
    advantages: [
      '100% free with absolutely zero commercial advertising banner ads',
      'Enables managing your entire classic game collection in a single library interface',
      'Extremely high emulation accuracy with minimal controller latency input'
    ],
    disadvantages: [
      'Highly complex configuration menus which can scare off casual users',
      'Does not come packaged with any game files (you must supply your own game ROMs)',
      'Touchscreen controls can feel awkward without a real physical controller'
    ],
    screenshots: [
      {
        title: 'Emulation Screen',
        type: 'custom',
        content: '🎮 Libretro Core: SNES (Snes9x)\n[ Game Loaded: Super Mario World ]\nFPS: 60.0 | Latency: 4ms\nControls: Virtual Overlay Active\n[ Save State ] [ Load State ] [ Fast Forward ]',
        accentColor: '#8b5cf6'
      }
    ],
    reviews: [
      {
        id: 'ra1',
        username: 'RetroGamer92',
        rating: 4,
        date: '2026-06-30',
        comment: 'Takes an hour to set up and configure your files correctly, but once you do, it is the absolute best way to play classic games on the go. Zero ads is incredible.'
      }
    ],
    isTrending: false,
    isNew: true
  }
];
