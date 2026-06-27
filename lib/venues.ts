export type Venue = { name: string; channel: string };

export const VENUES: Record<string, Venue[]> = {
  Andheri: [
    { name: "Andheri Gold's Gym",              channel: "Gym"              },
    { name: "Snap Fitness Andheri West",        channel: "Gym"              },
    { name: "Cult.fit Andheri",                 channel: "Gym"              },
    { name: "SEEPZ Office Park",                channel: "Corporate Office" },
    { name: "Andheri Station Stall",            channel: "Metro Stall"      },
    { name: "DN Nagar Metro Stall",             channel: "Metro Stall"      },
    { name: "Infiniti Mall Food Court",         channel: "Café"             },
    { name: "D.G. Ruparel College",             channel: "College"          },
    { name: "Kokilaben Hospital",               channel: "Hospital"         },
    { name: "Andheri Sports Complex",           channel: "School"           },
  ],
  BKC: [
    { name: "BKC Gold's Gym",                  channel: "Gym"              },
    { name: "Cubic Fitness BKC",                channel: "Gym"              },
    { name: "WeWork BKC",                       channel: "Corporate Office" },
    { name: "MMRDA Offices",                    channel: "Corporate Office" },
    { name: "One BKC Office Tower",             channel: "Corporate Office" },
    { name: "Bombay Canteen Café",              channel: "Café"             },
    { name: "Jio World Cafés",                  channel: "Café"             },
    { name: "BKC Bus Depot Stall",              channel: "Metro Stall"      },
    { name: "BKC Metro Station Stall",          channel: "Metro Stall"      },
    { name: "MMRDA Grounds Food Court",         channel: "Café"             },
  ],
  Bandra: [
    { name: "Bandra Gold's Gym",                channel: "Gym"              },
    { name: "Gold's Gym Pali Hill",             channel: "Gym"              },
    { name: "The Outfit Bandra",                channel: "Gym"              },
    { name: "St. Andrew's College",             channel: "College"          },
    { name: "Rizvi College",                    channel: "College"          },
    { name: "Lilavati Hospital",                channel: "Hospital"         },
    { name: "Birdsong Café",                    channel: "Café"             },
    { name: "Linking Road Cafés",               channel: "Café"             },
    { name: "Bandra Station Stall",             channel: "Metro Stall"      },
    { name: "Bandra Office Complexes",          channel: "Corporate Office" },
  ],
  Powai: [
    { name: "Powai Gold's Gym",                 channel: "Gym"              },
    { name: "Cult.fit Powai",                   channel: "Gym"              },
    { name: "Nirvana Fitness Powai",            channel: "Gym"              },
    { name: "IIT Bombay Campus Canteen",        channel: "College"          },
    { name: "Hiranandani Business Park",        channel: "Corporate Office" },
    { name: "Nahar Amrit Shakti Offices",       channel: "Corporate Office" },
    { name: "Hiranandani Hospital",             channel: "Hospital"         },
    { name: "Galleria Food Court",              channel: "Café"             },
    { name: "Powai Lake Cafés",                 channel: "Café"             },
  ],
  "Lower Parel": [
    { name: "Lower Parel Gold's Gym",           channel: "Gym"              },
    { name: "Cult.fit Lower Parel",             channel: "Gym"              },
    { name: "Phoenix Palladium Food Court",     channel: "Café"             },
    { name: "Todi Mills Cafés",                 channel: "Café"             },
    { name: "Kamala Mills Offices",             channel: "Corporate Office" },
    { name: "One Indiabulls Centre",            channel: "Corporate Office" },
    { name: "One International Centre",         channel: "Corporate Office" },
    { name: "Lower Parel Station Stall",        channel: "Metro Stall"      },
  ],
  Borivali: [
    { name: "Snap Fitness Borivali",            channel: "Gym"              },
    { name: "Cult.fit Borivali",                channel: "Gym"              },
    { name: "Poisar Gym",                       channel: "Gym"              },
    { name: "St. Francis College",             channel: "College"          },
    { name: "Borivali College Canteen",         channel: "College"          },
    { name: "Growel's 101 Mall Food Court",     channel: "Café"             },
    { name: "Borivali Station Stall",           channel: "Metro Stall"      },
    { name: "National Park Entrance Stall",     channel: "Metro Stall"      },
    { name: "Borivali Office Hub",              channel: "Corporate Office" },
  ],
  Thane: [
    { name: "Thane Gold's Gym",                 channel: "Gym"              },
    { name: "Cult.fit Thane",                   channel: "Gym"              },
    { name: "Viviana Mall Food Court",          channel: "Café"             },
    { name: "Korum Mall Café",                  channel: "Café"             },
    { name: "Wagle Estate Offices",             channel: "Corporate Office" },
    { name: "Jupiter Hospital",                 channel: "Hospital"         },
    { name: "Thane Station Stall",              channel: "Metro Stall"      },
    { name: "Kalwa Industrial Stall",           channel: "Corporate Office" },
  ],
  Vashi: [
    { name: "Vashi Gold's Gym",                 channel: "Gym"              },
    { name: "Cult.fit Vashi",                   channel: "Gym"              },
    { name: "Inorbit Mall Vashi",               channel: "Café"             },
    { name: "MGM Hospital Vashi",               channel: "Hospital"         },
    { name: "Vashi Station Stall",              channel: "Metro Stall"      },
    { name: "CIDCO Office Towers",              channel: "Corporate Office" },
    { name: "Vashi Office Hub",                 channel: "Corporate Office" },
    { name: "Pillai College Canteen",           channel: "College"          },
  ],
};

export const getVenuesForArea = (area: string, channels?: string[]): Venue[] => {
  const all = VENUES[area] ?? [];
  if (!channels || channels.length === 0) return all;
  return all.filter((v) => channels.includes(v.channel));
};

export const getVenueListString = (area: string, channels?: string[]): string =>
  getVenuesForArea(area, channels)
    .map((v) => `${v.name} (${v.channel})`)
    .join(", ");

export const buildAreaFallbackPlan = (area: string, channels: string[], pkg: number): string => {
  const venues  = getVenuesForArea(area, channels);
  const gym     = venues.find((v) => v.channel === "Gym")              ?? venues[0];
  const office  = venues.find((v) => v.channel === "Corporate Office");
  const packs   = Math.round(pkg / 10);
  const first   = Math.max(1, Math.round(packs * 0.2));

  return `FIRST_MISSION: ${gym?.name ?? area + " gym"} — sell Flamin' Fun Puffs Mini (₹10) between 7–9 AM. Script: "Bhai, pre-workout snack try kar — MadMix ka naya puff hai, sirf dus rupaye!"
SEVEN_DAY_TARGET: Sell ${packs} packs in 7 days. That's your full starter stock out the door and ₹${pkg} in your pocket.
YOUR_TERRITORY: ${area} is yours — strong demand and low MadSquad seller coverage right now. You're first mover here.
WHAT_TO_STOCK: Lead with Flamin' Fun Puffs Mini — proven gym seller.${office ? ` Add Mighty Masala Bhujia Mini for ${office.name}.` : ""} Both at ₹10, easy impulse buy.
FIRST_MILESTONE: Sell your first ${first} packs to earn your First Win badge + 50 bonus points + ₹${Math.round(pkg * 0.2)} back on your starter. Aaj pehle ${first} nikaalo!`;
};
