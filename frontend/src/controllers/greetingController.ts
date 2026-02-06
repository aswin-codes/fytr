// utils/greetingController.ts

import { GreetingData } from "@/src/types/greetingTypes";

export const getGreeting = (userName?: string | null): GreetingData => {
  const hour = new Date().getHours();
  const name = userName || 'Champion';
  
  // Early Morning (12am - 5am)
  if (hour >= 0 && hour < 5) {
    const earlyMorningGreetings = [
      {
        greeting: `Burning the Midnight Oil, ${name}`,
        emoji: "🌙",
        message: "Late night gains? Respect the dedication!"
      },
      {
        greeting: `Night Owl Mode, ${name}`,
        emoji: "🦉",
        message: "The grind never sleeps! Let's crush it!"
      },
      {
        greeting: `Beast Mode, ${name}`,
        emoji: "💪",
        message: "While they sleep, you train. Champion mentality!"
      }
    ];
    return earlyMorningGreetings[Math.floor(Math.random() * earlyMorningGreetings.length)];
  }
  
  // Morning (5am - 12pm)
  if (hour >= 5 && hour < 12) {
    const morningGreetings = [
      {
        greeting: `Good Morning, ${name}`,
        emoji: "☀️",
        message: "Morning warrior! Time to dominate the day!"
      },
      {
        greeting: `Rise & Grind, ${name}`,
        emoji: "🏆",
        message: "Early bird gets the gains! Let's go!"
      },
      {
        greeting: `Sunrise Strong, ${name}`,
        emoji: "🌅",
        message: "Fresh start, fresh PRs. Make it count!"
      },
      {
        greeting: `Hey ${name}!`,
        emoji: "💪",
        message: "Breakfast of champions: hard work!"
      }
    ];
    return morningGreetings[Math.floor(Math.random() * morningGreetings.length)];
  }
  
  // Afternoon (12pm - 5pm)
  if (hour >= 12 && hour < 17) {
    const afternoonGreetings = [
      {
        greeting: `Good Afternoon, ${name}`,
        emoji: "🔥",
        message: "Peak performance hours! Let's lift!"
      },
      {
        greeting: `What's Up, ${name}?`,
        emoji: "⚡",
        message: "Break time? More like break PRs time!"
      },
      {
        greeting: `Power Hour, ${name}`,
        emoji: "💥",
        message: "Energy is high, form is tight. Perfect!"
      },
      {
        greeting: `Hey ${name}!`,
        emoji: "🎯",
        message: "No slump here, just pumps!"
      }
    ];
    return afternoonGreetings[Math.floor(Math.random() * afternoonGreetings.length)];
  }
  
  // Evening (5pm - 9pm)
  if (hour >= 17 && hour < 21) {
    const eveningGreetings = [
      {
        greeting: `Good Evening, ${name}`,
        emoji: "🌆",
        message: "Prime time for gains! Make it legendary!"
      },
      {
        greeting: `Golden Hour, ${name}`,
        emoji: "✨",
        message: "The gym is calling. Answer with fire!"
      },
      {
        greeting: `What's Good, ${name}?`,
        emoji: "⚔️",
        message: "Work hard, lift harder. Let's do this!"
      },
      {
        greeting: `Evening, ${name}`,
        emoji: "🌇",
        message: "End the day stronger than you started!"
      }
    ];
    return eveningGreetings[Math.floor(Math.random() * eveningGreetings.length)];
  }
  
  // Night (9pm - 12am)
  const nightGreetings = [
    {
      greeting: `Night Shift, ${name}`,
      emoji: "🌃",
      message: "Late night lifts hit different. Own it!"
    },
    {
      greeting: `Hey ${name}!`,
      emoji: "🌙",
      message: "When others rest, legends train!"
    },
    {
      greeting: `Good Evening, ${name}`,
      emoji: "⭐",
      message: "Finish the day on a high note. You got this!"
    },
    {
      greeting: `What's Up, ${name}?`,
      emoji: "💫",
      message: "Perfect form doesn't have a bedtime!"
    }
  ];
  return nightGreetings[Math.floor(Math.random() * nightGreetings.length)];
};

/**
 * Get a simple greeting based on time of day
 * @param userName - User's display name (optional)
 * @returns string - Simple greeting text
 */
export const getSimpleGreeting = (userName?: string | null): string => {
  const hour = new Date().getHours();
  const name = userName || 'there';
  
  if (hour >= 0 && hour < 5) return `Up Late, ${name}`;
  if (hour >= 5 && hour < 12) return `Good Morning, ${name}`;
  if (hour >= 12 && hour < 17) return `Good Afternoon, ${name}`;
  if (hour >= 17 && hour < 21) return `Good Evening, ${name}`;
  return `Good Night, ${name}`;
};

/**
 * Get motivational workout message based on time
 * @returns string - Motivational message
 */
export const getWorkoutMotivation = (): string => {
  const hour = new Date().getHours();
  
  const motivations = {
    earlyMorning: [
      "Dedication at its finest! 🌟",
      "The grind never stops! 💪",
      "While they sleep, you conquer! 🦾"
    ],
    morning: [
      "Seize the day! 🌅",
      "Morning gains = Best gains! ⚡",
      "Start strong, finish stronger! 💯"
    ],
    afternoon: [
      "Peak performance time! 🎯",
      "Crushing midday goals! 🔥",
      "Power through! 💥"
    ],
    evening: [
      "Prime time for PRs! 🏆",
      "Evening excellence! ✨",
      "End strong! 💪"
    ],
    night: [
      "Late night legends! 🌙",
      "Committed to greatness! ⭐",
      "No days off! 🔥"
    ]
  };
  
  let timeOfDay: keyof typeof motivations;
  
  if (hour >= 0 && hour < 5) timeOfDay = 'earlyMorning';
  else if (hour >= 5 && hour < 12) timeOfDay = 'morning';
  else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
  else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
  else timeOfDay = 'night';
  
  const messages = motivations[timeOfDay];
  return messages[Math.floor(Math.random() * messages.length)];
};