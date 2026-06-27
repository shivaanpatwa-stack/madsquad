export type Venue = { name: string; channel: string };

export const VENUES: Record<string, Venue[]> = {
  Andheri: [
    { name: "Gold's Gym Andheri West",   channel: "Gym"              },
    { name: "Snap Fitness Andheri",       channel: "Gym"              },
    { name: "SEEPZ Office Park",          channel: "Corporate Office" },
    { name: "Andheri Station Stall",      channel: "Metro Stall"      },
    { name: "D.G. Ruparel College",       channel: "College"          },
    { name: "Infiniti Mall Food Court",   channel: "Café"             },
  ],
  BKC: [
    { name: "Gold's Gym BKC",            channel: "Gym"              },
    { name: "Cubic Fitness BKC",          channel: "Gym"              },
    { name: "WeWork BKC",                 channel: "Corporate Office" },
    { name: "One BKC Office Tower",       channel: "Corporate Office" },
    { name: "BKC Metro Station Stall",    channel: "Metro Stall"      },
    { name: "MMRDA Grounds Food Court",   channel: "Café"             },
  ],
  Bandra: [
    { name: "Gold's Gym Bandra",          channel: "Gym"              },
    { name: "The Bandra Gym",             channel: "Gym"              },
    { name: "St. Andrew's College",       channel: "College"          },
    { name: "Bandra Station Stall",       channel: "Metro Stall"      },
    { name: "Linking Road Café",          channel: "Café"             },
    { name: "Bandstand Café Strip",       channel: "Café"             },
  ],
  Powai: [
    { name: "Gold's Gym Powai",           channel: "Gym"              },
    { name: "Nirvana Fitness Powai",      channel: "Gym"              },
    { name: "IIT Bombay Campus Canteen",  channel: "College"          },
    { name: "Hiranandani Business Park",  channel: "Corporate Office" },
    { name: "Galleria Café Powai",        channel: "Café"             },
  ],
  "Lower Parel": [
    { name: "Gold's Gym Lower Parel",     channel: "Gym"              },
    { name: "Phoenix Mills Food Court",   channel: "Café"             },
    { name: "Kamala Mills Offices",       channel: "Corporate Office" },
    { name: "One International Centre",   channel: "Corporate Office" },
    { name: "Lower Parel Station Stall",  channel: "Metro Stall"      },
  ],
  Borivali: [
    { name: "Snap Fitness Borivali",      channel: "Gym"              },
    { name: "Poisar Gym",                 channel: "Gym"              },
    { name: "Growel's 101 Mall Café",     channel: "Café"             },
    { name: "Borivali College Canteen",   channel: "College"          },
    { name: "Borivali Station Stall",     channel: "Metro Stall"      },
  ],
  Thane: [
    { name: "Gold's Gym Thane",           channel: "Gym"              },
    { name: "Viviana Mall Food Court",    channel: "Café"             },
    { name: "Wagle Estate Office Hub",    channel: "Corporate Office" },
    { name: "Thane Station Stall",        channel: "Metro Stall"      },
    { name: "Kalwa Industrial Stall",     channel: "Corporate Office" },
  ],
  Vashi: [
    { name: "Gold's Gym Vashi",           channel: "Gym"              },
    { name: "Inorbit Mall Food Court",    channel: "Café"             },
    { name: "Vashi Station Stall",        channel: "Metro Stall"      },
    { name: "Pillai College Canteen",     channel: "College"          },
    { name: "CIDCO Office Towers",        channel: "Corporate Office" },
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
  const venues = getVenuesForArea(area, channels);
  const gym    = venues.find((v) => v.channel === "Gym")              ?? venues[0];
  const office = venues.find((v) => v.channel === "Corporate Office");
  const packs  = Math.round(pkg / 10);
  const first  = Math.max(1, Math.round(packs * 0.2));

  return `FIRST_MISSION: ${gym?.name ?? area + " gym"} — sell Flamin' Fun Puffs Mini (₹10) between 7–9 AM. Script: "Bhai, pre-workout snack try kar — MadMix ka naya puff hai, sirf dus rupaye!"
SEVEN_DAY_TARGET: Sell ${packs} packs in 7 days. That's your full starter stock out the door and ₹${pkg} in your pocket.
YOUR_TERRITORY: ${area} is yours — strong demand and low MadSquad seller coverage right now. You're first mover here.
WHAT_TO_STOCK: Lead with Flamin' Fun Puffs Mini — proven gym seller.${office ? ` Add Mighty Masala Bhujia Mini for ${office.name}.` : ""} Both at ₹10, easy impulse buy.
FIRST_MILESTONE: Sell your first ${first} packs to earn your First Win badge + 50 bonus points + ₹${Math.round(pkg * 0.2)} back on your starter. Aaj pehle ${first} nikaalo!`;
};
