
export type SoundKey =
  | 'CORRECT_ANSWER' // Randomly picks from a list
  | 'WRONG_ANSWER'   // Randomly picks from a list
  | 'BACKGROUND_MUSIC'
  | 'MATCHING_CONNECT'
  | 'ITEM_UNLOCKED'
  | 'ENCOURAGEMENT'
  | 'ROUND_WIN'
  | 'TYPE'
  | 'DECISION'
  | 'BUTTON_CLICK'
  | 'SEQUENCE_ITEM_POP'
  | 'SEQUENCE_ITEM_SLIDE' // New key for sliding sound
  // New keys for timed mode
  | 'ARE_YOU_READY'
  | 'COUNTDOWN_3'
  | 'COUNTDOWN_2'
  | 'COUNTDOWN_1'
  | 'COUNTDOWN_GO'
  | 'ROCKET_WHOOSH'
  | 'TIMER_LOW'
  | 'TIMER_END';

// Using a Record to map SoundKey to asset details
export const AudioAssets: Record<SoundKey, { path: string | string[]; loop: boolean; volume?: number }> = {
  // Random sounds for correct answers
  CORRECT_ANSWER: {
    path: [
      '/audio/amazing.mp3',
      '/audio/correct.mp3',
      '/audio/spark.mp3',
      '/audio/ting.mp3',
      '/audio/very-good.mp3',
      '/audio/wooow.mp3',
      '/audio/yeahhh.mp3',
    ],
    loop: false,
    volume: 0.8,
  },
  // Random sounds for incorrect answers
  WRONG_ANSWER: {
    path: [
      '/audio/wrong.mp3',
      '/audio/incorrect.mp3',
      '/audio/buzz.mp3',
      '/audio/no.mp3',
      '/audio/oh-oh.mp3',
      '/audio/ohhh.mp3',
    ],
    loop: false,
    volume: 0.7
  },
  // Single sounds
  BACKGROUND_MUSIC: {
    path: '/audio/background.mp3',
    loop: true,
    volume: 0.3,
  },
  MATCHING_CONNECT: {
    path: '/audio/connect.mp3',
    loop: false,
    volume: 0.9,
  },
  ITEM_UNLOCKED: {
    path: '/audio/item-unlocked.mp3',
    loop: false,
    volume: 1.0,
  },
  ENCOURAGEMENT: {
    path: '/audio/encouragement.mp3',
    loop: false,
    volume: 1.0,
  },
  ROUND_WIN: {
    path: '/audio/round-win.mp3',
    loop: false,
    volume: 1.0,
  },
  TYPE: {
    path: '/audio/type.mp3',
    loop: false,
    volume: 0.5,
  },
  DECISION: {
    path: '/audio/decision.mp3',
    loop: false,
    volume: 0.7,
  },
  BUTTON_CLICK: {
    path: '/audio/button-click.mp3',
    loop: false,
    volume: 0.6,
  },
  SEQUENCE_ITEM_POP: {
    path: '/audio/ting.mp3',
    loop: false,
    volume: 0.5,
  },
  SEQUENCE_ITEM_SLIDE: {
    path: '/audio/rocket-whoosh.MP3',
    loop: false,
    volume: 0.4,
  },
  // Sounds for timed mode (mapping to specific, new sound files)
  ARE_YOU_READY: {
    path: '/audio/are-you-ready.MP3',
    loop: false,
    volume: 1.0,
  },
  COUNTDOWN_3: {
    path: '/audio/3.MP3',
    loop: false,
    volume: 0.9,
  },
  COUNTDOWN_2: {
    path: '/audio/2.MP3',
    loop: false,
    volume: 0.9,
  },
  COUNTDOWN_1: {
    path: '/audio/1.MP3',
    loop: false,
    volume: 0.9,
  },
  COUNTDOWN_GO: {
    path: '/audio/go.MP3',
    loop: false,
    volume: 1.0,
  },
  ROCKET_WHOOSH: {
    path: '/audio/rocket-whoosh.MP3', // New specific sound
    loop: false,
    volume: 0.8
  },
  TIMER_LOW: {
    path: '/audio/timer-low-time.MP3', // For when time is running out (e.g., last 15 seconds)
    loop: true, // Changed to true to support continuous warning sound
    volume: 0.4
  },
  TIMER_END: {
    path: '/audio/timer-times-up.MP3', // For when time is up
    loop: false,
    volume: 0.9
  }
};
