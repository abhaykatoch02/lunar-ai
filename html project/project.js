/* ==========================================================================
   THE GODI EXPRESS (AAJ TAK EDITION) — ENGLISH + DESI INDIAN NEWSROOM ENGINE
   Features:
   - Real Live 24x7 Indian TV Streaming (Aaj Tak HD, India Today, ABP, NDTV via HLS.js)
   - Sidebar Mini Live TV Monitor + Full Broadcast Studio View
   - 100% English Language with Authentic Indian Godi Media Satire
   - Dual Spin Mode: "🌶️ Full Godi Mode" vs "🎓 Viva / Serious Mode"
   - 5-Stage Kanban Pipeline + Drag & Drop + Sub-Editor Studio + TRP Analytics
   ========================================================================== */

let editorialMode = 'godi'; // 'godi' | 'serious'
let activeDeskFilter = 'all';
let searchQuery = '';
let activeStoryId = null;
let selectedLeadStoryId = 'GE-101';
let currentStudioDb = 148.2;
let flashIndex = 0;
let mainHls = null;
let miniHls = null;

// Live Indian TV Stream Channels (HLS .m3u8 + YouTube Live Embed fallback)
const LIVE_TV_STREAMS = {
  aajtak: {
    name: 'AAJ TAK HD • LIVE 24x7 TV BROADCAST (SABSE TEZ)',
    url: 'https://feeds.intoday.in/aajtak/api/aajtakhd/master.m3u8',
    type: 'hls'
  },
  indiatoday: {
    name: 'INDIA TODAY • LIVE 24x7 ENGLISH TV BROADCAST',
    url: 'https://d1rc86nwwc9fag.cloudfront.net/vglive-sk-293160/master.m3u8',
    type: 'hls'
  },
  abp: {
    name: 'ABP NEWS HD • LIVE INDIAN TV BROADCAST',
    url: 'https://d1rc86nwwc9fag.cloudfront.net/vglive-sk-472500/abpnews/master.m3u8',
    type: 'hls'
  },
  ndtv: {
    name: 'NDTV 24x7 • LIVE INDIAN TV BROADCAST',
    url: 'https://cdn.pishow.tv/ott/live/315/master.m3u8',
    type: 'hls'
  },
  yt_aajtak: {
    name: 'AAJ TAK OFFICIAL YOUTUBE LIVE STREAM',
    url: 'https://www.youtube.com/embed/Nq2wYlWFucg?autoplay=1&mute=0',
    type: 'youtube'
  }
};

// Stage definitions (English with Indian Godi Media flavor)
const STAGES = [
  {
    id: 'pitch',
    stepNum: 'STAGE 01',
    godiTitle: 'WhatsApp Forward Received (Phupha Ji)',
    seriousTitle: 'Story Pitch & Bureau Intake'
  },
  {
    id: 'draft',
    stepNum: 'STAGE 02',
    godiTitle: 'Adding Desi Masala & Spin',
    seriousTitle: 'Correspondent Drafting'
  },
  {
    id: 'review',
    stepNum: 'STAGE 03',
    godiTitle: 'IT Cell & Agenda Alignment',
    seriousTitle: 'Sub-Editor Copy Review'
  },
  {
    id: 'legal',
    stepNum: 'STAGE 04',
    godiTitle: 'Nehru Blame & Bulldozer Check',
    seriousTitle: 'Fact-Check & Legal Clearance'
  },
  {
    id: 'press',
    stepNum: 'STAGE 05',
    godiTitle: 'Ready for 9 PM Screaming (Halla Bol)',
    seriousTitle: 'Approved for Print & Broadcast'
  }
];

const DESK_LABELS = {
  masterstroke: { godi: '56-Inch Masterstroke', serious: 'Economy & Policy' },
  whatsapp: { godi: 'WhatsApp DNA & Chip', serious: 'Science & Technology' },
  nehru: { godi: 'Nehru Blame & Bulldozer', serious: 'National & Archives' },
  distraction: { godi: 'Seema-Sachin Distraction', serious: 'Culture & Society' }
};

const FLASH_HEADLINES = [
  '🔥 SABSE BADI KHABAR: Noida Studio deploys 4 Bulldozers & 2 Helicopters inside newsroom; Tonight at 9 PM: "Did Nehru Cause Yesterday\'s Traffic Jam in Bengaluru?"',
  '🚨 MASTERSTROKE FLASH: Tomato touching ₹160/kg declared 100% cure for kidney stones by Noida Film City Ayurvedic Panel!',
  '📢 DNA EXCLUSIVE: After ₹2000 Note, GPS Nano-Chip discovered inside crispy Jalebi in Sector-18 Noida! NASA stunned!',
  '⚡ VISHWAGURU ALERT: White House & Kremlin reportedly waiting for Phupha Ji\'s "Good Morning Lotus" WhatsApp forward before starting cabinet meeting!'
];

// Authentic Indian Godi Media Stories Dataset (in crisp English!)
let stories = [
  {
    id: 'GE-101',
    stage: 'press',
    desk: 'masterstroke',
    priority: 'MASTERSTROKE',
    reporter: 'Arnab Goswami (150dB)',
    initials: 'AG',
    words: 640,
    targetWords: 650,
    decibels: '149 dB',
    visualEmoji: '🧅📈👑',
    godiHeadline: 'Why Onion at ₹120/kg & Petrol at ₹110/L Is Actually A 56-Inch Masterstroke For National Intermittent Fasting',
    seriousHeadline: 'Retail Inflation & Vegetable Supply Chain Pressures Analyzed Across Major Indian Metro Mandis',
    godiDeck: 'Exclusive study from Phupha Ji’s Family WhatsApp Group proves skipping onions boosts GDP by 400% and eliminates crying in Indian kitchens.',
    seriousDeck: 'Agricultural economists examine seasonal monsoon disruptions, cold-storage bottlenecks, and buffer stock interventions in Nashik and Delhi.',
    godiBody: `NOIDA FILM CITY (HALLA BOL BUREAU): While opposition parties are crying over vegetable and fuel prices, our 9 PM shouting panel of astrologers has officially declared ₹120/kg onions as a historic surgical strike on cholesterol.\n\nScreaming continuously at 149 decibels without taking a breath, our Chief Anchor demonstrated how Indian citizens who stop buying onions automatically save 15 minutes of chopping time every morning—time that can now be utilized to forward Vishwaguru reels on WhatsApp.\n\nFurthermore, declassified files from 1954 strongly suggest that the habit of eating onions with parathas was originally introduced due to Nehru’s policies!`,
    seriousBody: `NEW DELHI: Retail vegetable prices witnessed a sharp uptick across major metropolitan markets this week, driven primarily by unseasonal rainfall in key agrarian belts of Maharashtra and Karnataka.\n\nSupply chain analysts note that buffer stock releases from central agencies are expected to stabilize wholesale rates over the next fortnight as fresh kharif arrivals reach regional mandis.`,
    checklist: [
      { text: 'Forwarded by at least 3 Retired Uncles on Family WhatsApp Group?', done: true },
      { text: 'Headline contains "56-Inch Masterstroke" or "Danka"?', done: true },
      { text: 'Blamed 1950s Nehru policy in Paragraph 3?', done: true },
      { text: 'Added 5 Red Arrows, Bulldozer PNG & Siren sound effects?', done: true }
    ],
    comments: [
      { author: 'Chief Editor Sudhir', text: 'Brilliant spin! Also add a graphic showing how people in America are crying for Indian onions.' },
      { author: 'Sponsor Desk (Vimal)', text: 'Approved for Page 1 Lead Banner. 100% Advertiser Safe!' }
    ]
  },
  {
    id: 'GE-102',
    stage: 'press',
    desk: 'whatsapp',
    priority: 'BREAKING',
    reporter: 'Sudhir DNA-Chaudhary',
    initials: 'SC',
    words: 590,
    targetWords: 600,
    decibels: '144 dB',
    visualEmoji: '💵📡🛰️',
    godiHeadline: 'DNA EXCLUSIVE: After ₹2000 Note, Satellite GPS Nano-Chip Discovered Inside Hot Jalebi & Samosa in Noida!',
    seriousHeadline: 'Digital India & UPI FinTech Revolution: Street Vendors in Tier-2 Cities Hit 90% Cashless Adoption',
    godiDeck: 'Sugar syrup acts as a liquid lithium conductor transmitting live digestion signals 120 feet underground directly to ISRO satellites.',
    seriousDeck: 'Comprehensive FinTech survey highlights rapid QR code penetration and micro-credit access for urban small enterprises.',
    godiBody: `NOIDA SECTOR-16A (FORENSIC DNA LAB): The same legendary investigative team that discovered a satellite nano-chip inside the ₹2000 currency note in 2016 has uncovered another scientific miracle.\n\nWith emotional violin music playing in the background, our anchor held a magnifying glass over a crispy Jalebi from Sector-18 market and proved that its spiral shape acts as a 5G radar antenna.\n\nCitizens are advised to salute their Sunday morning Jalebi-Fafda before eating so that the satellite captures a patriotic selfie!`,
    seriousBody: `MUMBAI / BENGALURU: A nationwide survey of urban micro-enterprises reveals that over 90% of street food vendors and small retailers in Tier-2 cities now rely on UPI QR codes as their primary transaction medium.`,
    checklist: [
      { text: 'Forwarded by at least 3 Retired Uncles on Family WhatsApp Group?', done: true },
      { text: 'Headline contains "56-Inch Masterstroke" or "Danka"?', done: true },
      { text: 'Zero cross-checking with actual ISRO scientists?', done: true },
      { text: 'Added 5 Red Arrows, Bulldozer PNG & Siren sound effects?', done: true }
    ],
    comments: [
      { author: 'PCR Graphics Team', text: '3D rotating Samosa with green laser beams is ready for the 9 PM broadcast!' }
    ]
  },
  {
    id: 'GE-103',
    stage: 'legal',
    desk: 'nehru',
    priority: 'BREAKING',
    reporter: 'Anjana Om-Helicopter',
    initials: 'AO',
    words: 520,
    targetWords: 600,
    decibels: '146 dB',
    visualEmoji: '🚜📜⚡',
    godiHeadline: 'HALLA BOL INVESTIGATION: Why Did My 5G Reel Buffer For 4 Seconds Last Night? Was It Caused By Nehru In 1948?',
    seriousHeadline: 'BharatNet & 5G Spectrum Expansion: Reviewing Optical Fiber Infrastructure Across Rural Gram Panchayats',
    godiDeck: 'Tonight on our 8-Window Debate: 7 anchors will scream simultaneously while the Opposition spokesperson’s mic stays permanently muted.',
    seriousDeck: 'Department of Telecommunications releases quarterly audit on high-speed broadband connectivity and rural tower milestones.',
    godiBody: `SPECIAL ARCHIVE DESK: When our Managing Editor’s Instagram reel buffered for 4 seconds inside the Noida Film City parking lot yesterday, our Historical Blame Bureau immediately opened dusty files from 1948.\n\nShocking findings reveal that not a single 5G fiber-optic cable was laid during the First Five-Year Plan in 1951! Why was high-speed gaming router latency ignored 75 years ago? The Nation Wants To Know!`,
    seriousBody: `NEW DELHI: The Department of Telecommunications released its quarterly infrastructure audit, noting steady progress in optical fiber deployment across rural blocks.`,
    checklist: [
      { text: 'Forwarded by at least 3 Retired Uncles on Family WhatsApp Group?', done: true },
      { text: 'Headline contains "56-Inch Masterstroke" or "Danka"?', done: true },
      { text: 'Blamed 1950s Nehru policy in Paragraph 3?', done: true },
      { text: 'Added 5 Red Arrows, Bulldozer PNG & Siren sound effects?', done: false }
    ],
    comments: [
      { author: 'PCR Producer', text: 'Shrink the opposition panelist window to 2x2 pixels and run a breaking ticker over his face.' }
    ]
  },
  {
    id: 'GE-104',
    stage: 'review',
    desk: 'distraction',
    priority: 'DISTRACTION',
    reporter: 'Chitra Bulldozer-Tripathi',
    initials: 'CT',
    words: 450,
    targetWords: 500,
    decibels: '142 dB',
    visualEmoji: '💃🕺🎥',
    godiHeadline: '36-Hour Non-Stop Coverage: What Did Seema & Sachin Eat For Breakfast Today? Live Drone Camera From Roof!',
    seriousHeadline: 'Broadcast Audience Research (BARC): Analyzing Prime-Time Television Allocation & Media Consumption Trends',
    godiDeck: 'All coverage of university exam paper leaks, railway waiting lists, and unemployment immediately cancelled to deploy 14 OB vans outside Sachin’s kitchen!',
    seriousDeck: 'Media analysts evaluate the ratio of public-interest civic reporting versus viral tabloid segments during evening broadcast hours.',
    godiBody: `GREATER NOIDA (NATIONAL DISTRACTION BUREAU): Forget your college exams, ignore hospital queues, and stop asking about jobs—because Sachin just added crushed ginger to his morning tea!\n\nOur correspondent climbed atop the neighborhood water tank with military binoculars to confirm whether two spoons of sugar were used. Watch 18 anchors dissect this historic tea ceremony live!`,
    seriousBody: `NEW DELHI: Media researchers reviewing prime-time broadcast allocations noted a significant rise in viral human-interest and tabloid segments during evening slots over the past quarter.`,
    checklist: [
      { text: 'Forwarded by at least 3 Retired Uncles on Family WhatsApp Group?', done: true },
      { text: 'Zero mention of exam paper leaks, jobs, or train delays?', done: true },
      { text: 'Added dramatic "Gadar" sunny deol sound effect 15 times?', done: true },
      { text: 'Added 5 Red Arrows, Bulldozer PNG & Siren sound effects?', done: false }
    ],
    comments: [
      { author: 'Assignment Desk', text: 'Keep running this non-stop until Sunday midnight so viewers forget about real issues!' }
    ]
  },
  {
    id: 'GE-105',
    stage: 'draft',
    desk: 'masterstroke',
    priority: 'MASTERSTROKE',
    reporter: 'Amish Gullu-Devgan',
    initials: 'AD',
    words: 360,
    targetWords: 550,
    decibels: '143 dB',
    visualEmoji: '🕳️🛵🚀',
    godiHeadline: 'AAR-PAAR EXCLUSIVE: Why Giant Highway Potholes Are Free Spine Acupressure & Chandrayaan Moon-Rover Training!',
    seriousHeadline: 'Municipal Road Audit: Post-Monsoon Resurfacing Deadlines & Smart City Contractor Accountability',
    godiDeck: 'Why pay ₹5,000 at a luxury chiropractic clinic when a 2-km Indian auto-rickshaw ride realigns your entire backbone for free?',
    seriousDeck: 'Civic engineering bodies review road maintenance contracts and commuter safety protocols across metropolitan corridors.',
    godiBody: `AAR-PAAR MASTERSTROKE DESK: Critics call them "waterlogged potholes," but visionaries call them "Decentralized Ayurvedic Spine Realignment Craters." Every time your scooter bounces 3 feet in the air, blood circulation increases by 200% and Indian youth get free training to drive rovers on the Moon's south pole!`,
    seriousBody: `MUMBAI / BENGALURU: Municipal corporations have initiated post-monsoon resurfacing contracts across arterial roads following citizen feedback on commuter safety.`,
    checklist: [
      { text: 'Forwarded by at least 3 Retired Uncles on Family WhatsApp Group?', done: true },
      { text: 'Headline contains "56-Inch Masterstroke" or "Danka"?', done: true },
      { text: 'Blamed 1950s Nehru policy in Paragraph 3?', done: false },
      { text: 'Added 5 Red Arrows, Bulldozer PNG & Siren sound effects?', done: false }
    ],
    comments: [
      { author: 'Sub-Editor', text: 'Also mention that potholes naturally prevent overspeeding, saving millions on speed-breakers!' }
    ]
  },
  {
    id: 'GE-106',
    stage: 'pitch',
    desk: 'whatsapp',
    priority: 'BREAKING',
    reporter: 'Chintu Tyagi (WhatsApp PhD)',
    initials: 'CT',
    words: 240,
    targetWords: 500,
    decibels: '140 dB',
    visualEmoji: '🌍🇮🇳🎺',
    godiHeadline: 'VISHWAGURU DANKA: Trump & Putin Spotted Eating Poha-Jalebi After Reading Phupha Ji’s WhatsApp Forward!',
    seriousHeadline: 'Global Diplomacy & Bilateral Trade: Reviewing India’s Strategic Agreements at Multilateral Summits',
    godiDeck: 'Heavily photoshopped image received on "Good Morning Lotus Family Group" triggers emergency 9 PM celebration in Noida Studio.',
    seriousDeck: 'External Affairs bureau summarizes key trade corridors, defense partnerships, and technology transfer pacts.',
    godiBody: `FORWARDED AS RECEIVED: Our WhatsApp Intake Desk just received an ultra-HD 144p image showing a Poha-Kachori stall right outside the White House. Studio astrologers confirm that the US Dollar will soon be replaced by Hajmola tablets!`,
    seriousBody: `NEW DELHI: Bilateral trade delegations concluded a three-day summit focusing on semiconductor supply chains, renewable energy, and cross-border digital payments.`,
    checklist: [
      { text: 'Forwarded by at least 3 Retired Uncles on Family WhatsApp Group?', done: true },
      { text: 'Headline contains "56-Inch Masterstroke" or "Danka"?', done: true },
      { text: 'Blamed 1950s Nehru policy in Paragraph 3?', done: false },
      { text: 'Added 5 Red Arrows, Bulldozer PNG & Siren sound effects?', done: false }
    ],
    comments: [
      { author: 'WhatsApp Desk', text: 'Ramesh Uncle forwarded this in 8 housing society groups! Clear for prime time immediately!' }
    ]
  },
  {
    id: 'GE-107',
    stage: 'pitch',
    desk: 'nehru',
    priority: 'DANGER',
    reporter: 'Ravish Kumar (Ground Zero)',
    initials: 'RK',
    words: 490,
    targetWords: 500,
    decibels: '42 dB (TOO CALM!)',
    visualEmoji: '⚠️📉🚫',
    godiHeadline: '[DANGER: REAL JOURNALISM!] Calm Ground Report on Exam Paper Leaks, Railway General Coaches & Hospital Beds',
    seriousHeadline: 'Special Ground Report: Public Examination Reforms, Railway Passenger Capacity & District Healthcare',
    godiDeck: 'RED ALERT: Correspondent spoke politely without screaming, showed verified facts, and forgot to praise our Pan Masala sponsor!',
    seriousDeck: 'Field correspondents across three states document student grievances, commuter railway upgrades, and rural clinic staffing.',
    godiBody: `IT CELL COMPLIANCE WARNING: This manuscript contains zero shouting, zero sirens, zero mention of Seema-Sachin, and actual interviews with unemployed youth and train passengers. Recommend immediate deletion before sponsors cancel their ads!`,
    seriousBody: `PATNA / PRAYAGRAJ: Field correspondents visited state universities and railway junctions to document student demands for timely recruitment calendars and expanded general coach capacity.`,
    checklist: [
      { text: 'Forwarded by at least 3 Retired Uncles on Family WhatsApp Group?', done: false },
      { text: 'Headline contains "56-Inch Masterstroke" or "Danka"?', done: false },
      { text: 'Blamed 1950s Nehru policy in Paragraph 3?', done: false },
      { text: 'Added 5 Red Arrows, Bulldozer PNG & Siren sound effects?', done: false }
    ],
    comments: [
      { author: 'HR & Channel Owner', text: '🚨 Who let a real journalist inside Noida Film City?! Quarantine this story in Stage 1 or trash it!' }
    ]
  }
];

// 6-Window Live Indian TV Debate Panelists (in English + Desi Vibes)
let debatePanelists = [
  {
    name: 'Arnab Loudswami (HOST)',
    role: 'CHIEF SCREAMING ANCHOR',
    emoji: '🤬🎙️',
    db: '152 dB',
    quote: '"MUJHE DRUGS DO! THE NATION WANTS TO KNOW WHY NEHRU DID THIS!!"',
    shouting: true,
    muted: false
  },
  {
    name: 'Dr. Sambit Danka-Patra',
    role: 'VISHWAGURU SPOKESPERSON',
    emoji: '🪷🗣️',
    db: '146 dB',
    quote: '"Look Arnab, even aliens on Mars are chanting Masterstroke today!"',
    shouting: true,
    muted: false
  },
  {
    name: 'Maulana TV-Package',
    role: 'PERMANENT SHOUTING GUEST',
    emoji: '🧔‍♂️💢',
    db: '142 dB',
    quote: '"Are suniye toh sahi!! (Continuous unintelligible shouting for TRP)"',
    shouting: true,
    muted: false
  },
  {
    name: 'Gen. Gussa Bakshi (Retd)',
    role: 'MISSILE & RADAR EXPERT',
    emoji: '🎖️🚀',
    db: '147 dB',
    quote: '"Fire BrahMos right now from the Noida Studio roof!!"',
    shouting: true,
    muted: false
  },
  {
    name: 'Opposition Spokesperson',
    role: 'OPPOSITION (MIC MUTED 🔇)',
    emoji: '🤐📉',
    db: '0 dB (MUTED)',
    quote: '"Sir, I want to talk about unemployment and paper lea..." [AUDIO CUT BY PCR]',
    shouting: false,
    muted: true
  },
  {
    name: 'Pandit Choomantar Ji',
    role: 'SAMOSA & UFO ASTROLOGER',
    emoji: '🔮🪐',
    db: '139 dB',
    quote: '"Saturn’s alignment confirms potholes are good for kundali!"',
    shouting: true,
    muted: false
  }
];

// Newsroom Roster Data
const ROSTER_MEMBERS = [
  {
    emoji: '📢',
    godiName: 'Arnab Loudswami',
    seriousName: 'A. Goswami (Managing Editor)',
    godiRole: 'Chief Ear-Drum Destroyer • 9 PM Poochta Hai Bharat',
    seriousRole: 'Editor-in-Chief & Prime-Time Broadcast Host',
    godiBio: 'Holds the world record for shouting "The Nation Wants To Know" 54 times in 60 seconds without inhaling oxygen. Allergic to calm facts.',
    seriousBio: 'Oversees daily editorial lineups, prime-time broadcast debates, and front-page lead story clearances.',
    stat1Label: 'PEAK DECIBEL',
    stat1Val: '152.4 dB',
    stat2Label: 'MICS DESTROYED',
    stat2Val: '24 / week'
  },
  {
    emoji: '🧬',
    godiName: 'Sudhir DNA-Chaudhary',
    seriousName: 'S. Chaudhary (Executive Editor)',
    godiRole: 'Head of ₹2000 Note Chip & WhatsApp Science',
    seriousRole: 'Senior Editorial Columnist & Policy Analyst',
    godiBio: 'World-renowned scientist famous for discovering satellite GPS nano-chips inside ₹2000 notes, Samosas, and Jalebis with sad violin music.',
    seriousBio: 'Leads evening explainer segments, graphic storytelling, and national policy analysis.',
    stat1Label: 'SPIN ACCURACY',
    stat1Val: '99.9%',
    stat2Label: 'BLACKBOARD SHOWS',
    stat2Val: '420+ Ep'
  },
  {
    emoji: '🚁',
    godiName: 'Anjana Om-Helicopter',
    seriousName: 'A. Kashyap (Senior Bureau Chief)',
    godiRole: 'Halla Bol Commando & 1947 Nehru Blame Specialist',
    seriousRole: 'Chief National Affairs Correspondent',
    godiBio: 'Parachutes directly from a helicopter into Noida Studio to prove how every modern pothole is secretly a 1952 conspiracy.',
    seriousBio: 'Directs field reporting bureaus, parliamentary coverage, and special election broadcasts.',
    stat1Label: 'NEHRU BLAME SPEED',
    stat1Val: '0.01 sec',
    stat2Label: 'DEBATE WINDOWS',
    stat2Val: '12 Boxes'
  },
  {
    emoji: '🚜',
    godiName: 'Amish Gullu-Devgan',
    seriousName: 'A. Devgan (Senior Debate Editor)',
    godiRole: 'Aar-Paar Dangal & Table-Banging Director',
    seriousRole: 'Prime-Time Policy & Debate Editor',
    godiBio: 'National champion in banging the studio glass table and shouting "Tauba-Tauba" and "Danka". Consumes 5 packs of Strepsils daily.',
    seriousBio: 'Coordinates multi-panelist evening discussions and political bureau assignments.',
    stat1Label: 'TABLE SLAMS / HR',
    stat1Val: '85 Slams',
    stat2Label: 'FACT CHECKS',
    stat2Val: '0% (Banned)'
  }
];

/* ==========================================================================
   INITIALIZATION & REAL LIVE TV STREAMING ENGINE (HLS.js)
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  renderWireTicker();
  renderAllViews();
  startPressCountdown();
  initLiveTvStreams('aajtak');
});

function initLiveTvStreams(channelKey) {
  const stream = LIVE_TV_STREAMS[channelKey] || LIVE_TV_STREAMS.aajtak;
  const mainVideo = document.getElementById('mainLiveVideo');
  const miniVideo = document.getElementById('miniLiveVideo');
  const ytIframe = document.getElementById('ytFallbackIframe');
  const titleEl = document.getElementById('activeChannelTitle');
  const statusEl = document.getElementById('streamStatusText');

  if (titleEl) titleEl.textContent = stream.name;

  // Handle YouTube Official Live Embed option
  if (stream.type === 'youtube') {
    if (mainHls) { mainHls.destroy(); mainHls = null; }
    mainVideo.style.display = 'none';
    ytIframe.style.display = 'block';
    ytIframe.src = stream.url;
    if (statusEl) statusEl.textContent = 'Streaming Official YouTube Live Broadcast';
    return;
  }

  // HLS Native / HLS.js Live TV Stream
  ytIframe.style.display = 'none';
  ytIframe.src = '';
  mainVideo.style.display = 'block';

  if (window.Hls && Hls.isSupported()) {
    if (mainHls) mainHls.destroy();
    mainHls = new Hls({ enableWorker: true, lowLatencyMode: true });
    mainHls.loadSource(stream.url);
    mainHls.attachMedia(mainVideo);
    mainHls.on(Hls.Events.MANIFEST_PARSED, () => {
      mainVideo.play().catch(() => {});
      if (statusEl) statusEl.textContent = `● LIVE NOW: ${stream.name} (Real-Time TV Feed)`;
    });
    mainHls.on(Hls.Events.ERROR, (event, data) => {
      if (data.fatal && statusEl) {
        statusEl.textContent = 'Stream reconnecting... (Or switch channel from dropdown above)';
      }
    });

    // Also attach Aaj Tak Live to the Sidebar Mini-TV Monitor on first load
    if (!miniHls && miniVideo) {
      miniHls = new Hls({ enableWorker: true });
      miniHls.loadSource(LIVE_TV_STREAMS.aajtak.url);
      miniHls.attachMedia(miniVideo);
      miniHls.on(Hls.Events.MANIFEST_PARSED, () => {
        miniVideo.play().catch(() => {});
      });
    }
  } else if (mainVideo.canPlayType('application/vnd.apple.mpegurl')) {
    mainVideo.src = stream.url;
    mainVideo.play().catch(() => {});
    if (miniVideo && !miniVideo.src) {
      miniVideo.src = LIVE_TV_STREAMS.aajtak.url;
      miniVideo.play().catch(() => {});
    }
  }
}

function changeLiveTvChannel(channelKey) {
  initLiveTvStreams(channelKey);
  const stream = LIVE_TV_STREAMS[channelKey];
  showToast(`📺 Switched Live TV Broadcast to: ${stream.name}`);
}

function unmuteLiveTv() {
  const mainVideo = document.getElementById('mainLiveVideo');
  if (mainVideo) {
    mainVideo.muted = false;
    mainVideo.volume = 1.0;
    mainVideo.play().catch(() => {});
    showToast('🔊 Live TV Audio Unmuted! Enjoy the 148dB broadcast!');
  }
}

function renderAllViews() {
  updateModeBrandingText();
  renderKanbanBoard();
  renderTvDebateGrid();
  renderBroadsheetPreview();
  renderAnalyticsView();
  renderRosterGrid();
  updateKPIStats();
}

/* ==========================================================================
   WEB AUDIO API: REAL INDIAN AMBULANCE SIREN ("WEE-WOO / HI-LO" + YELP)
   ========================================================================== */
let sirenAudioCtx = null;

function playAajTakSirenSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!sirenAudioCtx) {
      sirenAudioCtx = new AudioContextClass();
    }
    if (sirenAudioCtx.state === 'suspended') {
      sirenAudioCtx.resume();
    }

    const now = sirenAudioCtx.currentTime;
    const totalDuration = 3.6;

    // 1. Classic Ambulance Two-Tone "WEE-WOO-WEE-WOO" (Hi-Lo 960Hz / 650Hz)
    // Plus a second slight-detuned horn oscillator for that loud real Indian ambulance horn feel
    const oscMain = sirenAudioCtx.createOscillator();
    const oscHorn = sirenAudioCtx.createOscillator();
    const bandpass = sirenAudioCtx.createBiquadFilter();
    const sirenGain = sirenAudioCtx.createGain();

    oscMain.type = 'sawtooth';
    oscHorn.type = 'square';

    // Bandpass filter to shape it like a real rooftop megaphone/ambulance speaker
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(1100, now);
    bandpass.Q.setValueAtTime(1.4, now);

    // Phase 1 (0.0s to 1.8s): Classic Ambulance Hi-Lo "WEE - WOO - WEE - WOO"
    const hiTone = 960; // "WEE"
    const loTone = 660; // "WOO"
    const stepTime = 0.28;

    for (let i = 0; i < 6; i++) {
      const t = now + i * stepTime;
      const freq = i % 2 === 0 ? hiTone : loTone;
      // Slight pitch glide into each tone like a real mechanical ambulance siren
      oscMain.frequency.setValueAtTime(freq * 0.96, t);
      oscMain.frequency.exponentialRampToValueAtTime(freq, t + 0.04);

      oscHorn.frequency.setValueAtTime(freq * 1.006, t);
      oscHorn.frequency.exponentialRampToValueAtTime(freq * 1.003, t + 0.04);
    }

    // Phase 2 (1.68s to 3.5s): Fast Indian Ambulance "Yelp / Wail" (Rapidly sweeping 600Hz <-> 1350Hz)
    let tCursor = now + 6 * stepTime;
    for (let j = 0; j < 5; j++) {
      oscMain.frequency.linearRampToValueAtTime(1350, tCursor + 0.17);
      oscMain.frequency.linearRampToValueAtTime(620, tCursor + 0.34);

      oscHorn.frequency.linearRampToValueAtTime(1358, tCursor + 0.17);
      oscHorn.frequency.linearRampToValueAtTime(625, tCursor + 0.34);
      tCursor += 0.34;
    }

    sirenGain.gain.setValueAtTime(0.01, now);
    sirenGain.gain.linearRampToValueAtTime(0.34, now + 0.04);
    sirenGain.gain.setValueAtTime(0.34, now + totalDuration - 0.25);
    sirenGain.gain.exponentialRampToValueAtTime(0.001, now + totalDuration);

    oscMain.connect(bandpass);
    oscHorn.connect(bandpass);
    bandpass.connect(sirenGain);
    sirenGain.connect(sirenAudioCtx.destination);

    oscMain.start(now);
    oscHorn.start(now);
    oscMain.stop(now + totalDuration);
    oscHorn.stop(now + totalDuration);
  } catch (err) {
    console.warn('Ambulance siren audio error:', err);
  }
}

/* ==========================================================================
   AAJ TAK SIREN FLASH & TV STUDIO ACTIONS
   ========================================================================== */
function triggerBreakingSiren() {
  // Play loud synthesized Indian TV Breaking News Siren + Boom FX!
  playAajTakSirenSound();

  const overlay = document.getElementById('sirenOverlay');
  const sirenTexts = [
    '🚨 MEGA BREAKING • 148dB ALERT • PUTIN & TRUMP STUNNED BY NOIDA STUDIO MASTERSTROKE! 🚨',
    '🚨 HALLA BOL FLASH • 5G NANO-CHIP FOUND INSIDE HOT JALEBI • OPPOSITION SILENT! 🚨',
    '🚨 EXCLUSIVE ARCHIVE • HOW 1952 MONSOON POLICY CAUSED YESTERDAY’S TRAFFIC JAM! 🚨'
  ];
  document.getElementById('sirenBannerText').textContent = sirenTexts[Math.floor(Math.random() * sirenTexts.length)];
  overlay.classList.add('active');
  setTimeout(() => {
    overlay.classList.remove('active');
  }, 3400);
}

function cycleFlashHeadline() {
  flashIndex = (flashIndex + 1) % FLASH_HEADLINES.length;
  document.getElementById('liveFlashHeadline').textContent = FLASH_HEADLINES[flashIndex];
  triggerBreakingSiren();
}

function renderTvDebateGrid() {
  const grid = document.getElementById('tvDebateGrid');
  if (!grid) return;

  grid.innerHTML = debatePanelists.map((p, idx) => `
    <div class="debate-window ${p.shouting ? 'shouting' : ''} ${p.muted ? 'muted-panelist' : ''}">
      <div class="window-top-tag">
        <span class="window-role-tag">${p.role}</span>
        <span class="window-db-tag">${p.db}</span>
      </div>
      <div class="window-avatar-area">
        <span class="window-emoji">${p.emoji}</span>
        <p class="window-quote">${p.quote}</p>
      </div>
      <div class="window-nameplate">
        <span>${p.name}</span>
        <button class="btn-card-step" style="font-size:10px; padding:2px 6px;" onclick="togglePanelistMute(${idx})">
          ${p.muted ? '🔊 Unmute' : '🔇 Mute Mic'}
        </button>
      </div>
    </div>
  `).join('');
}

function togglePanelistMute(idx) {
  const p = debatePanelists[idx];
  p.muted = !p.muted;
  p.shouting = !p.muted;
  p.db = p.muted ? '0 dB (MUTED 🔇)' : '146 dB';
  renderTvDebateGrid();
  showToast(p.muted ? `🔇 Muted ${p.name}'s microphone!` : `🔊 Unmuted ${p.name} — back to screaming at 146dB!`);
}

function muteAllOpposition() {
  debatePanelists.forEach((p, i) => {
    if (i === 4) {
      p.muted = true;
      p.shouting = false;
      p.db = '0 dB (PERMANENT MUTE)';
      p.quote = '"[PCR Room permanently cut Opposition audio in national interest]"';
    }
  });
  renderTvDebateGrid();
  showToast('🔇 Masterstroke! Opposition Spokesperson mic permanently muted!');
}

function increaseAnchorVolume() {
  currentStudioDb = +(currentStudioDb + 12.5).toFixed(1);
  document.getElementById('tvLiveDb').textContent = `${currentStudioDb} dB 🔥`;
  document.getElementById('kpiDecibelVal').textContent = `${Math.round(currentStudioDb)} dB`;
  triggerBreakingSiren();
  showToast(`📢 Studio Anchor Volume boosted to ${currentStudioDb} dB! Ear-drums beware!`);
}

/* ==========================================================================
   VIEW 4: TRP, SPONSORS & AGENDA ANALYTICS
   ========================================================================== */
function renderAnalyticsView() {
  const grid = document.getElementById('analyticsGrid');
  if (!grid) return;

  const isGodi = editorialMode === 'godi';

  grid.innerHTML = `
    <div class="analytics-card">
      <h4 class="analytics-card-title">${isGodi ? '📺 Prime-Time Topic Allocation (9 PM Slot)' : '📊 Editorial Section Distribution'}</h4>
      <p class="analytics-card-sub">${isGodi ? 'How Noida Film City divides 24 hours of broadcast & print space:' : 'Breakdown of daily broadsheet column inches by bureau:'}</p>

      <div class="bar-metric-row">
        <div class="bar-metric-labels">
          <span>${isGodi ? '👑 56-Inch Masterstrokes & Vishwaguru Danka' : '🏛️ National Policy & Governance'}</span>
          <strong>48%</strong>
        </div>
        <div class="bar-metric-track"><div class="bar-metric-fill" style="width:48%; background: var(--press-crimson);"></div></div>
      </div>

      <div class="bar-metric-row">
        <div class="bar-metric-labels">
          <span>${isGodi ? '📜 Blaming Nehru (1947–1964 Archives)' : '📈 Economy, Markets & Mandis'}</span>
          <strong>29%</strong>
        </div>
        <div class="bar-metric-track"><div class="bar-metric-fill" style="width:29%; background: var(--masterstroke-gold);"></div></div>
      </div>

      <div class="bar-metric-row">
        <div class="bar-metric-labels">
          <span>${isGodi ? '💃 Seema-Sachin, Aliens & B-Town Weddings' : '🔬 Science, Tech & FinTech'}</span>
          <strong>22.9%</strong>
        </div>
        <div class="bar-metric-track"><div class="bar-metric-fill" style="width:23%; background: var(--distraction-purple);"></div></div>
      </div>

      <div class="bar-metric-row">
        <div class="bar-metric-labels">
          <span>${isGodi ? '⚠️ Unemployment, Paper Leaks & Hospitals' : '🎭 Culture & Weekend Features'}</span>
          <strong>${isGodi ? '0.01% (By Mistake)' : '12%'}</strong>
        </div>
        <div class="bar-metric-track"><div class="bar-metric-fill" style="width:${isGodi ? '1%' : '12%'}; background: var(--whatsapp-green);"></div></div>
      </div>
    </div>

    <div class="analytics-card">
      <h4 class="analytics-card-title">${isGodi ? '💰 Corporate Sponsor & Ad Revenue Meter' : '📰 Print Circulation & Edition Readiness'}</h4>
      <p class="analytics-card-sub">${isGodi ? 'Live status of top sponsors funding tonight’s 148dB screaming match:' : 'Real-time press lock metrics across metro printing centers:'}</p>

      <div class="bar-metric-row">
        <div class="bar-metric-labels">
          <span>${isGodi ? '🟧 Vimal Pan Masala (Zubaan Kesari L-Band Ads)' : '🗞️ New Delhi & NCR Broadsheet Quota'}</span>
          <strong>₹4.2 Cr / Day (98%)</strong>
        </div>
        <div class="bar-metric-track"><div class="bar-metric-fill" style="width:98%; background: var(--press-crimson);"></div></div>
      </div>

      <div class="bar-metric-row">
        <div class="bar-metric-labels">
          <span>${isGodi ? '🚜 Bulldozer Cement & Sariya Sponsors' : '🏙️ Mumbai & Western Bureau Quota'}</span>
          <strong>₹2.8 Cr / Day (89%)</strong>
        </div>
        <div class="bar-metric-track"><div class="bar-metric-fill" style="width:89%; background: var(--masterstroke-gold);"></div></div>
      </div>

      <div class="bar-metric-row">
        <div class="bar-metric-labels">
          <span>${isGodi ? '🍬 Strepsils & Warm Water Supply for Anchors' : '💻 Digital Portal & E-Paper Syndication'}</span>
          <strong>100% Stocked</strong>
        </div>
        <div class="bar-metric-track"><div class="bar-metric-fill" style="width:100%; background: var(--whatsapp-green);"></div></div>
      </div>
    </div>
  `;
}

/* ==========================================================================
   MODE SWITCHER: FULL GODI MODE vs SERIOUS VIVA MODE (ALL IN ENGLISH)
   ========================================================================== */
function setEditorialMode(mode) {
  editorialMode = mode;
  document.documentElement.setAttribute('data-spin', mode);

  document.getElementById('btnGodiMode').classList.toggle('active', mode === 'godi');
  document.getElementById('btnJournalismMode').classList.toggle('active', mode === 'serious');

  renderWireTicker();
  renderAllViews();

  if (activeStoryId) {
    openStoryStudio(activeStoryId);
  }

  const msg = mode === 'godi'
    ? '🌶️ FULL GODI MODE ACTIVATED: 56-Inch Masterstrokes, ₹2000 Note Chip, Nehru Blame & 148dB Screaming restored!'
    : '🎓 VIVA / SERIOUS MODE ACTIVATED: All terminology switched to formal English Journalism for faculty evaluation!';
  showToast(msg);
}

function updateModeBrandingText() {
  const isGodi = editorialMode === 'godi';

  document.getElementById('wireBadgeText').textContent = isGodi ? 'GODI WIRE LIVE • SABSE TEZ' : 'NATIONAL PRESS WIRE • LIVE';
  document.getElementById('sidebarKicker').textContent = isGodi ? 'NOIDA FILM CITY • SECTOR 16A' : 'EST. 1924 • NEW DELHI BUREAU';
  document.getElementById('sidebarBrandName').textContent = isGodi ? 'THE GODI EXPRESS' : 'THE CHRONICLE';
  document.getElementById('sidebarSubtitle').textContent = isGodi ? 'Sabse Tez Spin & Editorial CMS' : 'Editorial Workflow & Press CMS v4.2';

  document.getElementById('currentModeBadge').textContent = isGodi ? '🔥 FULL GODI' : '🎓 VIVA SAFE';
  document.getElementById('modeDescription').textContent = isGodi
    ? 'All Indian ground realities are automatically spun into 56-Inch Masterstrokes, Nehru Blame & 148dB Prime-Time Debates.'
    : 'Standard professional Indian newsroom mode active (safe for faculty evaluation & college viva demo).';

  document.getElementById('editionCode').textContent = isGodi ? 'NOIDA FILM CITY EDITION • VOL. #420' : 'NEW DELHI METRO EDITION • ISSUE #248';
  document.getElementById('weatherQuote').textContent = isGodi
    ? '🌤️ Delhi AQI: 495 (Declared Free Lung Pranayama Masterstroke)'
    : '🌤️ New Delhi: 29°C • Clear Skies';
  document.getElementById('pitchBtnLabel').textContent = isGodi ? 'Forward New Story' : 'Pitch New Story';

  document.getElementById('leftEarTitle').textContent = isGodi ? 'EDITORIAL DHARMA' : 'EDITORIAL STANDARD';
  document.getElementById('leftEarBody').textContent = isGodi
    ? '"Never question the Government; always scream at the Opposition & Nehru!"'
    : '"Independent Journalism, Verified Facts, Timely Print."';

  document.getElementById('mastheadLiveTag').textContent = isGodi
    ? 'SABSE TEZ • VISHWAGURU DANKA EDITION • 148 dB CERTIFIED'
    : 'NATIONAL DAILY BROADSHEET • EDITORIAL WORKFLOW SUITE';

  document.getElementById('mainMastheadTitle').textContent = isGodi
    ? 'The Daily Godi Express'
    : 'The Daily Chronicle';
  document.getElementById('mainMastheadSub').textContent = isGodi
    ? "INDIA'S #1 WHATSAPP UNIVERSITY & NOIDA FILM CITY BROADSHEET WORKFLOW SYSTEM • ZERO REAL ISSUES GUARANTEED"
    : 'NATIONAL MORNING EDITION • EDITORIAL WORKFLOW & PUBLISHING MANAGEMENT SYSTEM';

  document.getElementById('rightEarTitle').textContent = isGodi ? 'PRIME-TIME SPONSORS' : 'EDITION DETAILS';
  document.getElementById('rightEarBody').textContent = isGodi
    ? 'Vimal Pan Masala (Bolo Zubaan Kesari) • Strepsils Throat Lozenges'
    : 'Print Lock: 11:30 PM IST • 24 Pages Broadsheet';

  document.getElementById('kpi1Label').textContent = isGodi ? 'STORIES IN SPIN PIPELINE' : 'ACTIVE MANUSCRIPTS';
  document.getElementById('kpi2Label').textContent = isGodi ? 'READY FOR 9 PM DANGAL' : 'APPROVED FOR PRINT';
  document.getElementById('kpi3Label').textContent = isGodi ? 'AVG ANCHOR DECIBEL (DB)' : 'FACT-CHECK ACCURACY';
  document.getElementById('kpi4Label').textContent = isGodi ? 'REAL INDIAN ISSUES HIDDEN' : 'WORDS EDITED TODAY';

  document.querySelectorAll('.desk-label').forEach(el => {
    const deskId = el.getAttribute('data-desk-id');
    if (DESK_LABELS[deskId]) {
      el.textContent = isGodi ? DESK_LABELS[deskId].godi : DESK_LABELS[deskId].serious;
    }
  });
}

/* ==========================================================================
   WIRE TICKER (ENGLISH + INDIAN GODI MEDIA FLAVOR)
   ========================================================================== */
function renderWireTicker() {
  const tickerEl = document.getElementById('wireTickerContent');
  const godiItems = [
    '<strong>SABSE TEZ BREAKING:</strong> GPS Nano-Chip discovered inside hot Jalebi in Noida Sector-18; Sudhir Ji conducts live DNA test with violin music!',
    '<strong>56-INCH MASTERSTROKE:</strong> Petrol crossing ₹110/L declared great for youth knee joints as morning walks increase by 300%!',
    '<strong>9 PM HALLA BOL:</strong> 8-Window Debate tonight: "My cat spilled milk in Noida — Was Nehru’s 1954 dairy policy responsible?"',
    '<strong>WHATSAPP UNIVERSITY:</strong> Phupha Ji forwards NASA Diwali satellite photo for the 14th consecutive year — cleared for Page 1!',
    '<strong>PCR CONTROL ROOM:</strong> Opposition spokesperson mic muted to 0%; 5 packs of Strepsils rushed to studio for Arnab'
  ];
  const seriousItems = [
    '<strong>WIRE FLASH:</strong> Union Economic Survey & Mandi supply chain report cleared by sub-editor desk for Page 1 lead',
    '<strong>TECH BUREAU:</strong> Digital India & UPI FinTech adoption study completes fact-check verification',
    '<strong>PRINT SCHEDULE:</strong> New Delhi & Mumbai broadsheet plates lock at 23:30 HRS; 88% page quota filled'
  ];

  const list = editorialMode === 'godi' ? godiItems : seriousItems;
  tickerEl.innerHTML = list.map(item => `<span class="wire-item">🚨 ${item}</span>`).join('');
}

/* ==========================================================================
   KANBAN PIPELINE RENDERER + DRAG & DROP
   ========================================================================== */
function renderKanbanBoard() {
  const board = document.getElementById('kanbanBoard');
  const prioFilter = document.getElementById('priorityFilter').value;
  const isGodi = editorialMode === 'godi';

  const filteredStories = stories.filter(s => {
    const matchDesk = activeDeskFilter === 'all' || s.desk === activeDeskFilter;
    const matchPrio = prioFilter === 'all' || s.priority === prioFilter;
    const headline = isGodi ? s.godiHeadline : s.seriousHeadline;
    const deck = isGodi ? s.godiDeck : s.seriousDeck;
    const matchSearch = !searchQuery ||
      headline.toLowerCase().includes(searchQuery) ||
      deck.toLowerCase().includes(searchQuery) ||
      s.reporter.toLowerCase().includes(searchQuery) ||
      s.id.toLowerCase().includes(searchQuery);
    return matchDesk && matchPrio && matchSearch;
  });

  board.innerHTML = STAGES.map((stage, stageIdx) => {
    const stageStories = filteredStories.filter(s => s.stage === stage.id);
    const stageTitle = isGodi ? stage.godiTitle : stage.seriousTitle;

    const cardsHtml = stageStories.map(story => {
      const headline = isGodi ? story.godiHeadline : story.seriousHeadline;
      const deck = isGodi ? story.godiDeck : story.seriousDeck;
      const deskName = isGodi ? DESK_LABELS[story.desk].godi : DESK_LABELS[story.desk].serious;
      const pct = Math.min(100, Math.round((story.words / story.targetWords) * 100));
      const nextStage = STAGES[stageIdx + 1];

      return `
        <article
          class="story-card"
          draggable="true"
          ondragstart="handleDragStart(event, '${story.id}')"
          onclick="openStoryStudio('${story.id}')"
        >
          <div class="story-card-top">
            <span class="desk-badge desk-${story.desk}">${deskName}</span>
            <span class="priority-pill prio-${story.priority}">${story.priority}</span>
          </div>

          <h4 class="story-card-headline">${story.visualEmoji || ''} ${headline}</h4>
          <p class="story-card-deck">${deck}</p>

          <div class="story-progress-wrap">
            <div class="story-progress-labels">
              <span>${story.words} / ${story.targetWords} words</span>
              <span>${isGodi ? '🔊 ' + story.decibels : pct + '% complete'}</span>
            </div>
            <div class="story-progress-bar">
              <div class="story-progress-fill" style="width: ${pct}%"></div>
            </div>
          </div>

          <div class="story-card-footer">
            <div class="reporter-chip">
              <span class="reporter-avatar">${story.initials}</span>
              <span>${story.reporter}</span>
            </div>
            <div class="card-stage-actions" onclick="event.stopPropagation()">
              ${nextStage ? `
                <button class="btn-card-step" onclick="moveStoryStage('${story.id}', '${nextStage.id}')">
                  Next Stage →
                </button>
              ` : `
                <span class="btn-card-step" style="background: var(--whatsapp-green-soft); color: var(--whatsapp-green); border-color: transparent;">
                  ✓ Ready for Press
                </span>
              `}
            </div>
          </div>
        </article>
      `;
    }).join('');

    return `
      <div
        class="kanban-col"
        data-stage="${stage.id}"
        ondragover="handleDragOver(event)"
        ondragleave="handleDragLeave(event)"
        ondrop="handleDrop(event, '${stage.id}')"
      >
        <div class="kanban-col-header">
          <div>
            <span class="col-stage-num">${stage.stepNum}</span>
            <h4 class="col-stage-title">${stageTitle}</h4>
          </div>
          <span class="col-stage-count">${stageStories.length}</span>
        </div>
        <div class="kanban-cards-list">
          ${cardsHtml || `<div style="padding: 24px 10px; text-align:center; color: var(--ink-muted); font-size:12px; border: 1px dashed var(--border-subtle); border-radius:6px;">Drop story cards here</div>`}
        </div>
      </div>
    `;
  }).join('');
}

function handleDragStart(event, storyId) {
  event.dataTransfer.setData('text/plain', storyId);
}

function handleDragOver(event) {
  event.preventDefault();
  event.currentTarget.classList.add('drag-over');
}

function handleDragLeave(event) {
  event.currentTarget.classList.remove('drag-over');
}

function handleDrop(event, targetStageId) {
  event.preventDefault();
  event.currentTarget.classList.remove('drag-over');
  const storyId = event.dataTransfer.getData('text/plain');
  if (storyId) {
    moveStoryStage(storyId, targetStageId);
  }
}

function moveStoryStage(storyId, targetStageId) {
  const story = stories.find(s => s.id === storyId);
  if (!story) return;

  story.stage = targetStageId;
  const stageObj = STAGES.find(st => st.id === targetStageId);
  const stageTitle = editorialMode === 'godi' ? stageObj.godiTitle : stageObj.seriousTitle;

  renderAllViews();
  showToast(`📰 Story "${story.id}" advanced to: ${stageTitle}`);
}

/* ==========================================================================
   BROADSHEET FRONT-PAGE NEWSPAPER SIMULATOR
   ========================================================================== */
function renderBroadsheetPreview() {
  const paper = document.getElementById('broadsheetPaper');
  const selector = document.getElementById('leadStorySelector');
  const isGodi = editorialMode === 'godi';

  selector.innerHTML = stories.map(s => {
    const title = isGodi ? s.godiHeadline : s.seriousHeadline;
    const selected = s.id === selectedLeadStoryId ? 'selected' : '';
    return `<option value="${s.id}" ${selected}>[${s.id}] ${title.slice(0, 58)}...</option>`;
  }).join('');

  const leadStory = stories.find(s => s.id === selectedLeadStoryId) || stories[0];
  const secondaryStories = stories.filter(s => s.id !== leadStory.id);

  const paperName = isGodi ? 'The Daily Godi Express' : 'The Daily Chronicle';
  const paperMotto = isGodi
    ? '"QUESTIONS ONLY FOR OPPOSITION, PRAISE ONLY FOR SPONSORS • CERTIFIED BY WHATSAPP UNIVERSITY NOIDA"'
    : '"INDEPENDENT REPORTING, VERIFIED ANALYSIS • NATIONAL MORNING BROADSHEET EDITION"';

  const leadHeadline = isGodi ? leadStory.godiHeadline : leadStory.seriousHeadline;
  const leadDeck = isGodi ? leadStory.godiDeck : leadStory.seriousDeck;
  const leadBody = isGodi ? leadStory.godiBody : leadStory.seriousBody;

  const col1Stories = secondaryStories.slice(0, 2);
  const col3Stories = secondaryStories.slice(2, 5);

  paper.innerHTML = `
    <div class="paper-header">
      <div class="paper-kicker-bar">
        <span>${isGodi ? 'NOIDA FILM CITY • SECTOR 16A' : 'NEW DELHI • MUMBAI • BENGALURU'}</span>
        <span>SATURDAY, OCTOBER 30, 2026</span>
        <span>${isGodi ? 'PRICE: ₹2 (OR 1 WHATSAPP FAMILY GROUP FORWARD)' : 'PRICE: ₹8.00 • 24 PAGES'}</span>
      </div>
      <h1 class="paper-masthead-name">${paperName}</h1>
      <div class="paper-motto-bar">${paperMotto}</div>
    </div>

    <div class="paper-banner-headline">
      <span class="paper-banner-tag">${isGodi ? '🚨 SABSE TEZ • 56-INCH MASTERSTROKE EXCLUSIVE' : 'NATIONAL LEAD STORY'}</span>
      <h2 class="paper-banner-title">${leadHeadline}</h2>
      <p class="paper-banner-deck">${leadDeck}</p>
    </div>

    <div class="paper-columns-grid">
      <div class="paper-col">
        ${col1Stories.map(st => `
          <div class="paper-story-block" onclick="openStoryStudio('${st.id}')" style="cursor:pointer">
            <div class="paper-story-kicker">${isGodi ? DESK_LABELS[st.desk].godi : DESK_LABELS[st.desk].serious}</div>
            <h3 class="paper-story-title">${isGodi ? st.godiHeadline : st.seriousHeadline}</h3>
            <div class="paper-story-byline">By ${st.reporter.toUpperCase()} • ${st.words} Words</div>
            <p class="paper-story-body">${(isGodi ? st.godiBody : st.seriousBody).replace(/\n/g, '<br><br>')}</p>
          </div>
        `).join('')}
      </div>

      <div class="paper-col">
        <div class="paper-lead-visual">
          <div class="visual-graphic-stamp">${isGodi ? 'WHATSAPP UNIVERSITY & DNA VERIFIED' : 'CHRONICLE ARCHIVE PHOTO'}</div>
          <div class="visual-emoji-scene">${leadStory.visualEmoji || '📰🎙️🔥'}</div>
          <p class="visual-caption">
            ${isGodi
              ? 'FIG 1.0: 5 Red Arrows & Bulldozer graphics added by Noida Sub-Editor Desk to boost panic and TRP by 400% during 9 PM Dangal.'
              : 'FIG 1.0: Infographic compiled by the National Editorial Desk ahead of morning press lock.'}
          </p>
        </div>
        <div class="paper-story-byline">BY ${leadStory.reporter.toUpperCase()} • CHIEF CORRESPONDENT (${leadStory.decibels})</div>
        <p class="paper-story-body">${leadBody.replace(/\n/g, '<br><br>')}</p>
      </div>

      <div class="paper-col">
        ${col3Stories.map(st => `
          <div class="paper-story-block" onclick="openStoryStudio('${st.id}')" style="cursor:pointer">
            <div class="paper-story-kicker">${st.priority} • ${st.id}</div>
            <h3 class="paper-story-title">${isGodi ? st.godiHeadline : st.seriousHeadline}</h3>
            <div class="paper-story-byline">By ${st.reporter}</div>
            <p class="paper-story-body">${isGodi ? st.godiDeck : st.seriousDeck}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function updateFrontPageLead(storyId) {
  selectedLeadStoryId = storyId;
  renderBroadsheetPreview();
  showToast(`🗞️ Front-Page Lead Banner updated to Story ${storyId}!`);
}

function triggerPrintToast() {
  triggerBreakingSiren();
  showToast('🖨️ PRINTING PRESS STARTED: 50 Lakh copies with extra Masala & Red Arrows dispatched!');
}

/* ==========================================================================
   ROSTER GRID
   ========================================================================== */
function renderRosterGrid() {
  const grid = document.getElementById('rosterGrid');
  const isGodi = editorialMode === 'godi';

  grid.innerHTML = ROSTER_MEMBERS.map(m => `
    <div class="roster-card">
      <div class="roster-top">
        <div class="roster-avatar">${m.emoji}</div>
        <div>
          <h4 class="roster-name">${isGodi ? m.godiName : m.seriousName}</h4>
          <span class="roster-role">${isGodi ? m.godiRole : m.seriousRole}</span>
        </div>
      </div>
      <p class="roster-bio">${isGodi ? m.godiBio : m.seriousBio}</p>
      <div class="roster-stats">
        <div>
          <span class="roster-stat-label">${m.stat1Label}</span>
          <span class="roster-stat-val">${m.stat1Val}</span>
        </div>
        <div>
          <span class="roster-stat-label">${m.stat2Label}</span>
          <span class="roster-stat-val">${m.stat2Val}</span>
        </div>
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   SUB-EDITOR STORY STUDIO DRAWER
   ========================================================================== */
function openStoryStudio(storyId) {
  const story = stories.find(s => s.id === storyId);
  if (!story) return;

  activeStoryId = storyId;
  const isGodi = editorialMode === 'godi';
  const stageObj = STAGES.find(st => st.id === story.stage);

  document.getElementById('drawerStoryId').textContent = `MANUSCRIPT #${story.id}`;
  document.getElementById('drawerStageBadge').textContent = isGodi ? stageObj.godiTitle : stageObj.seriousTitle;

  document.getElementById('studioHeadlineInput').value = isGodi ? story.godiHeadline : story.seriousHeadline;
  document.getElementById('studioDeckInput').value = isGodi ? story.godiDeck : story.seriousDeck;
  document.getElementById('studioBodyInput').value = isGodi ? story.godiBody : story.seriousBody;

  document.getElementById('studioReporter').textContent = story.reporter;
  document.getElementById('studioDesk').textContent = isGodi ? DESK_LABELS[story.desk].godi : DESK_LABELS[story.desk].serious;
  document.getElementById('studioWordCount').textContent = `${story.words} / ${story.targetWords} words`;
  document.getElementById('studioScreamScore').textContent = story.decibels;

  renderStudioChecklist(story);
  renderStudioComments(story);

  document.getElementById('studioDrawerBackdrop').classList.add('open');
  document.getElementById('studioDrawer').classList.add('open');
}

function closeStoryStudio() {
  document.getElementById('studioDrawerBackdrop').classList.remove('open');
  document.getElementById('studioDrawer').classList.remove('open');
  activeStoryId = null;
}

function saveActiveStoryEdits() {
  const story = stories.find(s => s.id === activeStoryId);
  if (!story) return;

  const isGodi = editorialMode === 'godi';
  const newHeadline = document.getElementById('studioHeadlineInput').value;
  const newDeck = document.getElementById('studioDeckInput').value;
  const newBody = document.getElementById('studioBodyInput').value;

  if (isGodi) {
    story.godiHeadline = newHeadline;
    story.godiDeck = newDeck;
    story.godiBody = newBody;
  } else {
    story.seriousHeadline = newHeadline;
    story.seriousDeck = newDeck;
    story.seriousBody = newBody;
  }

  const wordCount = newBody.trim() ? newBody.trim().split(/\s+/).length : 0;
  story.words = wordCount * 8;
  document.getElementById('studioWordCount').textContent = `${story.words} / ${story.targetWords} words`;

  renderKanbanBoard();
  renderBroadsheetPreview();
}

function injectMasalaParagraph() {
  const story = stories.find(s => s.id === activeStoryId);
  if (!story) return;

  const masalaSnippets = [
    `\n\n[DESI GODI MASALA INJECTION]: Noida Studio astrologers and Retired Major General Bakshi have also confirmed that this 56-inch masterstroke has left neighbouring countries shivering in panic!`,
    `\n\n[WHATSAPP UNCLE VERIFICATION]: Forwarded JPEG with 6 Red Arrows from Phupha Ji's "Good Morning Lotus Family Group" independently proves that NASA satellites are saluting this decision!`,
    `\n\n[1947 ARCHIVE BLAME]: Declassified files reveal that if Nehru had taken the right steps in 1953, this problem would never have occurred — Poochta Hai Bharat!`
  ];

  const snippet = masalaSnippets[Math.floor(Math.random() * masalaSnippets.length)];
  const bodyInput = document.getElementById('studioBodyInput');
  bodyInput.value += snippet;
  saveActiveStoryEdits();
  showToast('🌶️ Injected Desi Godi Masala & Nehru Blame paragraph into manuscript!');
}

function renderStudioChecklist(story) {
  const container = document.getElementById('studioChecklist');
  container.innerHTML = story.checklist.map((item, idx) => `
    <label class="checklist-item">
      <input type="checkbox" ${item.done ? 'checked' : ''} onchange="toggleChecklistItem(${idx})" />
      <span>${item.text}</span>
    </label>
  `).join('');
}

function toggleChecklistItem(idx) {
  const story = stories.find(s => s.id === activeStoryId);
  if (!story) return;
  story.checklist[idx].done = !story.checklist[idx].done;
  showToast('✓ Editorial Clearance Checklist updated!');
}

function renderStudioComments(story) {
  const feed = document.getElementById('studioCommentsFeed');
  feed.innerHTML = story.comments.map(c => `
    <div class="comment-bubble">
      <div class="comment-author">${c.author}</div>
      <div>${c.text}</div>
    </div>
  `).join('');
}

function addStudioComment() {
  const input = document.getElementById('newCommentInput');
  const text = input.value.trim();
  if (!text || !activeStoryId) return;

  const story = stories.find(s => s.id === activeStoryId);
  story.comments.push({
    author: editorialMode === 'godi' ? 'Chief Spin Editor (You)' : 'Managing Editor (You)',
    text
  });
  input.value = '';
  renderStudioComments(story);
}

function advanceActiveStoryStage() {
  const story = stories.find(s => s.id === activeStoryId);
  if (!story) return;

  const currentIdx = STAGES.findIndex(st => st.id === story.stage);
  const nextStage = STAGES[currentIdx + 1];
  if (nextStage) {
    moveStoryStage(story.id, nextStage.id);
    openStoryStudio(story.id);
  } else {
    showToast('🎉 This story is already in the final "Ready for 9 PM Screaming" stage!');
  }
}

function rejectActiveStory() {
  if (!activeStoryId) return;
  const idx = stories.findIndex(s => s.id === activeStoryId);
  if (idx !== -1) {
    const removed = stories.splice(idx, 1)[0];
    closeStoryStudio();
    renderAllViews();
    showToast(`🗑️ Trashed Story ${removed.id} for containing suspiciously real ground journalism!`);
  }
}

/* ==========================================================================
   NEW STORY PITCH MODAL
   ========================================================================== */
function openPitchModal() {
  document.getElementById('pitchModalBackdrop').classList.add('open');
}

function closePitchModal() {
  document.getElementById('pitchModalBackdrop').classList.remove('open');
}

function fillSampleSarcasticPitch() {
  const samples = [
    {
      headline: 'Why Waiting 4 Hours In Bengaluru & Delhi Traffic Jam Is A Masterstroke For Family Bonding & Meditation!',
      deck: 'Noida Bureau survey reveals stationary cars save tyre rubber and allow citizens to listen to patriotic podcasts.',
      desk: 'masterstroke',
      priority: 'MASTERSTROKE',
      body: 'NOIDA TRAFFIC MASTERSTROKE: People honking in Silk Board and DND Flyway traffic jams fail to realize that sitting motionless in a car for 3 hours aligns the chakras and reduces reckless driving by 100%.'
    },
    {
      headline: 'SABSE TEZ EXCLUSIVE: 5000-Year-Old Ancient Wireless 5G Router Discovered Under Old Fort?',
      deck: 'Blurred photo forwarded on Phupha Ji’s WhatsApp Group shows Wi-Fi signal bars carved on stone pillar!',
      desk: 'whatsapp',
      priority: 'BREAKING',
      body: 'WHATSAPP ARCHAEOLOGY DESK: International scientists are stunned after our family WhatsApp group admin shared undeniable proof of ancient high-speed broadband.'
    }
  ];
  const pick = samples[Math.floor(Math.random() * samples.length)];
  document.getElementById('newStoryHeadline').value = pick.headline;
  document.getElementById('newStoryDeck').value = pick.deck;
  document.getElementById('newStoryDesk').value = pick.desk;
  document.getElementById('newStoryPriority').value = pick.priority;
  document.getElementById('newStoryBody').value = pick.body;
}

function submitNewStory(event) {
  event.preventDefault();
  const headline = document.getElementById('newStoryHeadline').value.trim();
  const deck = document.getElementById('newStoryDeck').value.trim();
  const desk = document.getElementById('newStoryDesk').value;
  const priority = document.getElementById('newStoryPriority').value;
  const reporter = document.getElementById('newStoryReporter').value.trim();
  const stage = document.getElementById('newStoryStage').value;
  const body = document.getElementById('newStoryBody').value.trim() || 'Submitted via WhatsApp University Noida Desk. Red arrows and bulldozer sirens queued.';

  const newId = `GE-${100 + stories.length + 1}`;
  const initials = reporter.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'WU';

  stories.unshift({
    id: newId,
    stage,
    desk,
    priority,
    reporter,
    initials,
    words: 380,
    targetWords: 500,
    decibels: '146 dB',
    visualEmoji: '🚨📢🔥',
    godiHeadline: headline,
    seriousHeadline: headline,
    godiDeck: deck,
    seriousDeck: deck,
    godiBody: body,
    seriousBody: body,
    checklist: [
      { text: 'Forwarded by at least 3 Retired Uncles on Family WhatsApp Group?', done: true },
      { text: 'Headline contains "56-Inch Masterstroke" or "Danka"?', done: false },
      { text: 'Blamed 1950s Nehru policy in Paragraph 3?', done: false },
      { text: 'Added 5 Red Arrows, Bulldozer PNG & Siren sound effects?', done: false }
    ],
    comments: [
      { author: 'Intake Desk', text: 'Fresh Indian story pitch added to pipeline!' }
    ]
  });

  document.getElementById('pitchStoryForm').reset();
  closePitchModal();
  renderAllViews();
  triggerBreakingSiren();
  showToast(`🚀 New Story "${newId}" pushed to the Newsroom Pipeline!`);
}

/* ==========================================================================
   VIEW NAVIGATION, FILTERS, THEME & UTILITIES
   ========================================================================== */
function switchView(viewName) {
  document.querySelectorAll('.workspace-view').forEach(v => v.classList.remove('active'));
  document.getElementById(`view-${viewName}`).classList.add('active');

  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
  });

  if (viewName === 'broadsheet') {
    renderBroadsheetPreview();
  } else if (viewName === 'tvstudio') {
    renderTvDebateGrid();
  } else if (viewName === 'analytics') {
    renderAnalyticsView();
  }
}

function filterByDesk(desk) {
  activeDeskFilter = desk;
  document.querySelectorAll('.desk-chip').forEach(chip => {
    chip.classList.toggle('active', chip.getAttribute('data-desk') === desk);
  });
  switchView('kanban');
  renderKanbanBoard();
}

function handleSearch(val) {
  searchQuery = val.trim().toLowerCase();
  renderKanbanBoard();
}

function applyFilters() {
  renderKanbanBoard();
}

function shuffleHeadlineSpin() {
  const prefixes = [
    '🔥 DANKA SPECIAL: ',
    '🚨 SABSE TEZ EXCLUSIVE: ',
    '📢 POOCHTA HAI BHARAT: ',
    '👑 56-INCH MASTERSTROKE: '
  ];
  stories.forEach(s => {
    const p = prefixes[Math.floor(Math.random() * prefixes.length)];
    if (!s.godiHeadline.startsWith('🔥') && !s.godiHeadline.startsWith('🚨') && !s.godiHeadline.startsWith('📢') && !s.godiHeadline.startsWith('👑')) {
      s.godiHeadline = p + s.godiHeadline;
    }
  });
  renderAllViews();
  triggerBreakingSiren();
  showToast('🌶️ Injected Aaj Tak style sensational prefixes into all headlines!');
}

function updateKPIStats() {
  const total = stories.length;
  const approved = stories.filter(s => s.stage === 'press').length;
  document.getElementById('kpiTotalCount').textContent = total;
  document.getElementById('navTotalStories').textContent = total;
  document.getElementById('kpiApprovedCount').textContent = approved;
}

function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);

  document.getElementById('themeIcon').textContent = next === 'dark' ? '☀️' : '🌙';
  document.getElementById('themeLabel').textContent = next === 'dark' ? 'Paper Light' : 'Studio Dark';
  showToast(next === 'dark' ? '🌙 Switched to 9 PM Prime-Time Dark Studio Mode!' : '☀️ Switched to Classic Broadsheet Newsprint Mode!');
}

function startPressCountdown() {
  let totalSeconds = 2 * 3600 + 14 * 60 + 39;
  const el = document.getElementById('pressCountdown');
  setInterval(() => {
    totalSeconds = totalSeconds > 0 ? totalSeconds - 1 : 7200;
    const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const s = String(totalSeconds % 60).padStart(2, '0');
    const label = editorialMode === 'godi' ? '9 PM SCREAM LOCK' : 'PRESS LOCK';
    el.innerHTML = `⏳ ${label}: <strong>${h}:${m}:${s}</strong>`;
  }, 1000);
}

function showToast(message) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3600);
}
