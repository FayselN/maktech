import { AppItem } from '../types';

export const PROMO_MAPPINGS: Record<string, { name: string; developer: string }> = {
  gemini: {
    name: 'Advanced AI Chatbot Pro',
    developer: 'Top Verified AI Publisher'
  },
  notion: {
    name: 'Modular Note & Database Wiki',
    developer: 'Premium Productivity Lab'
  },
  duolingo: {
    name: 'Bite-Sized Gamified Language Tutor',
    developer: 'Elite Language Science Team'
  },
  snapseed: {
    name: 'Professional RAW & Photo Tuner',
    developer: 'Professional Imaging Suite'
  },
  protonvpn: {
    name: 'Secure Zero-Logs Swiss Tunnel',
    developer: 'Swiss Security Foundations'
  },
  yotta: {
    name: 'Gamified Savings & Prize Draw Tracker',
    developer: 'Gamified Wealth Technologies'
  },
  phind: {
    name: 'AI Developer Code Companion & Search',
    developer: 'Developer Intelligence Labs'
  },
  ankidroid: {
    name: 'Spaced Repetition Flashcard Memory Deck',
    developer: 'Open-Source Memory Systems'
  },
  forest: {
    name: 'Gamified Focus Timer & Whitelist Garden',
    developer: 'Gamified Focus Labs'
  },
  solidexplorer: {
    name: 'Dual-Pane Material File & Cloud Commander',
    developer: 'Advanced System Tools Group'
  },
  brave: {
    name: 'Privacy Shield Fast Ad-Block Browser',
    developer: 'Privacy-First Web Foundation'
  },
  retroarch: {
    name: 'Modular Retro Console Emulator Frontend',
    developer: 'Libre Emulation Development'
  },
  capcut: {
    name: 'AI Video Timeline Editor & Transition Studio',
    developer: 'Creative Video Engine Labs'
  },
  mimo: {
    name: 'Interactive Daily Coding Playground',
    developer: 'Interactive Code Academy'
  },
  nordvpn: {
    name: 'Ultra-Fast Double Encryption Shield',
    developer: 'World-Class Cyber Security Network'
  }
};

export const CODE_MAPPINGS: Record<string, string> = {
  gemini: 'sm1',
  notion: 'sm2',
  duolingo: 'sm3',
  snapseed: 'sm4',
  protonvpn: 'sm5',
  yotta: 'sm6',
  phind: 'sm7',
  ankidroid: 'sm8',
  forest: 'sm9',
  solidexplorer: 'sm10',
  brave: 'sm11',
  retroarch: 'sm12',
  capcut: 'sm13',
  mimo: 'sm14',
  nordvpn: 'sm15'
};

/**
 * Gets the promotional / anonymized search code for a given app ID
 */
export function getAppSearchCode(appId: string): string {
  const norm = appId.toLowerCase();
  if (CODE_MAPPINGS[norm]) {
    return CODE_MAPPINGS[norm];
  }
  // Deterministic fallback for any other custom apps
  let hash = 0;
  for (let i = 0; i < norm.length; i++) {
    hash += norm.charCodeAt(i);
  }
  return `sm${(hash % 50) + 16}`;
}

/**
 * Gets the promotional / anonymized name for a given app ID or falls back to a generic name
 */
export function getPromoName(appId: string, defaultName: string): string {
  const normalizedId = appId.toLowerCase();
  return PROMO_MAPPINGS[normalizedId]?.name || `${defaultName} Companion`;
}

/**
 * Gets the promotional / anonymized developer for a given app ID
 */
export function getPromoDeveloper(appId: string, defaultDeveloper: string): string {
  const normalizedId = appId.toLowerCase();
  return PROMO_MAPPINGS[normalizedId]?.developer || 'Verified Pro Developer';
}

/**
 * Transforms an AppItem into a promotional AppItem where exact name, developer, and brand icons are anonymized
 * to intrigue users and redirect them to the Play Store for exact details.
 */
export function getPromoApp(app: AppItem): AppItem {
  const promoInfo = PROMO_MAPPINGS[app.id.toLowerCase()] || {
    name: `${app.name} Core Utility`,
    developer: 'Curated Pro Publisher'
  };

  // We replace the brand iconUrl with a mystery icon like 'HelpCircle' or 'Shield'
  // to avoid leaking the exact identity in the icon
  let mysteryIcon = 'Shield';
  if (app.category === 'AI') mysteryIcon = 'Sparkles';
  else if (app.category === 'Productivity') mysteryIcon = 'FileText';
  else if (app.category === 'Education') mysteryIcon = 'GraduationCap';
  else if (app.category === 'Utilities') mysteryIcon = 'Shield';
  else if (app.category === 'Photo Editing') mysteryIcon = 'Camera';
  else if (app.category === 'Finance') mysteryIcon = 'TrendingUp';
  else if (app.category === 'VPN') mysteryIcon = 'Shield';
  else if (app.category === 'Games') mysteryIcon = 'Gamepad2';

  // Let's use 'HelpCircle' or 'Shield' as a unified mysterious look,
  // or a Category-specific generic icon but clean from brand leaks.
  // Actually, 'Shield' is excellent because it represents security & verification.
  // Let's use 'Sparkles' for AI/curated and 'HelpCircle' as a generic mystery option.
  const isMystery = true;
  const chosenIcon = isMystery ? 'HelpCircle' : mysteryIcon;

  // Let's also anonymize any brand-leaking text inside descriptions
  let cleanDescription = app.description
    .replace(/Google/gi, 'Official')
    .replace(/Gemini/gi, 'AI')
    .replace(/Notion Labs/gi, 'Productivity')
    .replace(/Notion/gi, 'Workspace')
    .replace(/Duolingo/gi, 'Language Coach')
    .replace(/Snapseed/gi, 'Editor')
    .replace(/Proton/gi, 'Swiss')
    .replace(/Yotta/gi, 'Savings')
    .replace(/Phind/gi, 'AI Assistant')
    .replace(/Anki/gi, 'Memory Flashcards')
    .replace(/AnkiDroid/gi, 'Memory Companion')
    .replace(/Forest/gi, 'Focus timer')
    .replace(/Solid Explorer/gi, 'File Manager')
    .replace(/Brave/gi, 'Browser')
    .replace(/RetroArch/gi, 'Classic Emulator')
    .replace(/CapCut/gi, 'Video Editor')
    .replace(/Mimo/gi, 'Code Academy')
    .replace(/NordVPN/gi, 'VPN Client');

  let cleanLongDescription = app.longDescription
    .replace(/Google/gi, 'Official')
    .replace(/Gemini/gi, 'AI')
    .replace(/Notion Labs/gi, 'Productivity')
    .replace(/Notion/gi, 'Workspace')
    .replace(/Duolingo/gi, 'Language Coach')
    .replace(/Snapseed/gi, 'Editor')
    .replace(/Proton/gi, 'Swiss')
    .replace(/Yotta/gi, 'Savings')
    .replace(/Phind/gi, 'AI Assistant')
    .replace(/Anki/gi, 'Memory Flashcards')
    .replace(/AnkiDroid/gi, 'Memory Companion')
    .replace(/Forest/gi, 'Focus timer')
    .replace(/Solid Explorer/gi, 'File Manager')
    .replace(/Brave/gi, 'Browser')
    .replace(/RetroArch/gi, 'Classic Emulator')
    .replace(/CapCut/gi, 'Video Editor')
    .replace(/Mimo/gi, 'Code Academy')
    .replace(/NordVPN/gi, 'VPN Client');

  // Let's filter any screenshot content that leaks the exact brand names too
  const cleanScreenshots = app.screenshots.map(screen => {
    let cleanContent = screen.content
      .replace(/Google/gi, 'Official')
      .replace(/Gemini/gi, 'AI')
      .replace(/Notion Labs/gi, 'Productivity')
      .replace(/Notion/gi, 'Workspace')
      .replace(/Duolingo/gi, 'Language Coach')
      .replace(/Snapseed/gi, 'Editor')
      .replace(/Proton/gi, 'Swiss')
      .replace(/Yotta/gi, 'Savings')
      .replace(/Phind/gi, 'AI Assistant')
      .replace(/Anki/gi, 'Memory Flashcards')
      .replace(/AnkiDroid/gi, 'Memory Companion')
      .replace(/Forest/gi, 'Focus timer')
      .replace(/Solid Explorer/gi, 'File Manager')
      .replace(/Brave/gi, 'Browser')
      .replace(/RetroArch/gi, 'Classic Emulator')
      .replace(/CapCut/gi, 'Video Editor')
      .replace(/Mimo/gi, 'Code Academy')
      .replace(/NordVPN/gi, 'VPN Client');

    return {
      ...screen,
      content: cleanContent
    };
  });

  return {
    ...app,
    name: promoInfo.name,
    developer: promoInfo.developer,
    iconUrl: chosenIcon,
    description: cleanDescription,
    longDescription: cleanLongDescription,
    screenshots: cleanScreenshots,
    searchCode: getAppSearchCode(app.id)
  };
}
