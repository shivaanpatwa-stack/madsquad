export type Venue = { name: string; channel: string };

export const VENUES: Record<string, Venue[]> = {
  Andheri: [
    { name: "Andheri Gold's Gym",              channel: "Gym"              },
    { name: "Snap Fitness Andheri West",        channel: "Gym"              },
    { name: "Cult.fit Andheri",                 channel: "Gym"              },
    { name: "SEEPZ Office Park",                channel: "Corporate Office" },
    { name: "WeWork Andheri East",              channel: "Corporate Office" },
    { name: "Nehru Nagar Residential Hub",      channel: "Corporate Office" },
    { name: "Lokhandwala Complex Stalls",       channel: "Metro Stall"      },
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
    { name: "IIT Bombay Hostel Campus",         channel: "College"          },
    { name: "Hiranandani Gardens Residential",  channel: "Corporate Office" },
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
    { name: "WeWork Lower Parel",               channel: "Corporate Office" },
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
  Worli: [
    { name: "Worli Cult.fit",                   channel: "Gym"              },
    { name: "F45 Worli",                        channel: "Gym"              },
    { name: "Atria Mall Cafés",                 channel: "Café"             },
    { name: "Worli Sea Face Stalls",            channel: "Metro Stall"      },
    { name: "Lodha World Offices",              channel: "Corporate Office" },
    { name: "Peninsula Business Park",          channel: "Corporate Office" },
    { name: "Worli BPT Colony Canteen",         channel: "College"          },
  ],
  Dadar: [
    { name: "Dadar Gym Zone",                   channel: "Gym"              },
    { name: "Snap Fitness Dadar",               channel: "Gym"              },
    { name: "Ruparel College Dadar",            channel: "College"          },
    { name: "Kirti College",                    channel: "College"          },
    { name: "Hinduja Hospital",                 channel: "Hospital"         },
    { name: "Dadar Station West Stall",         channel: "Metro Stall"      },
    { name: "Dadar Station East Stall",         channel: "Metro Stall"      },
    { name: "Café Mysore",                      channel: "Café"             },
    { name: "Dadar Catering College",           channel: "College"          },
  ],
  Santacruz: [
    { name: "Santacruz Gym Hub",                channel: "Gym"              },
    { name: "Cult.fit Santacruz",               channel: "Gym"              },
    { name: "Mithibai College",                 channel: "College"          },
    { name: "Mithibai College Hostel",          channel: "College"          },
    { name: "NMIMS Hostel Vile Parle",          channel: "College"          },
    { name: "SVKM Campus Canteen",              channel: "College"          },
    { name: "Santacruz Station Stall",          channel: "Metro Stall"      },
    { name: "SV Road Offices",                  channel: "Corporate Office" },
    { name: "Santacruz Market Cafés",           channel: "Café"             },
  ],
  Juhu: [
    { name: "Juhu Beach Stalls",                channel: "Metro Stall"      },
    { name: "Gold's Gym Juhu",                  channel: "Gym"              },
    { name: "F45 Juhu",                         channel: "Gym"              },
    { name: "JW Marriott Café (lobby stall)",   channel: "Café"             },
    { name: "Juhu SNDT Women's University",     channel: "College"          },
    { name: "Kokilaben Dhirubhai Ambani Hosp.", channel: "Hospital"         },
    { name: "Sun-n-Sand Hotel Café",            channel: "Café"             },
  ],
  Versova: [
    { name: "Versova Beach Stalls",             channel: "Metro Stall"      },
    { name: "Versova Gym Co.",                  channel: "Gym"              },
    { name: "Lokhandwala Cafés",                channel: "Café"             },
    { name: "Seven Bungalows Café Row",         channel: "Café"             },
    { name: "Andheri (W) Station Stall",        channel: "Metro Stall"      },
    { name: "Evershine Colony Offices",         channel: "Corporate Office" },
  ],
  Malad: [
    { name: "Inorbit Mall Malad Foodcourt",     channel: "Café"             },
    { name: "Snap Fitness Malad",               channel: "Gym"              },
    { name: "Cult.fit Malad",                   channel: "Gym"              },
    { name: "Malad Station Stall",              channel: "Metro Stall"      },
    { name: "MHADA Colony Offices",             channel: "Corporate Office" },
    { name: "Kishinchand Chellaram College",    channel: "College"          },
    { name: "Infinity Mall Malad",              channel: "Café"             },
  ],
  Goregaon: [
    { name: "Hub Mall Food Court",              channel: "Café"             },
    { name: "Goregaon Gym Hub",                 channel: "Gym"              },
    { name: "Cult.fit Goregaon",               channel: "Gym"              },
    { name: "Goregaon Station Stall",           channel: "Metro Stall"      },
    { name: "Film City Road Offices",           channel: "Corporate Office" },
    { name: "NAEERI College Canteen",           channel: "College"          },
    { name: "Oberoi Mall Café",                 channel: "Café"             },
  ],
  Kandivali: [
    { name: "Growel's 101 Mall Café",           channel: "Café"             },
    { name: "Kandivali Gym Plus",               channel: "Gym"              },
    { name: "Snap Fitness Kandivali",           channel: "Gym"              },
    { name: "Kandivali Station West Stall",     channel: "Metro Stall"      },
    { name: "Kandivali Station East Stall",     channel: "Metro Stall"      },
    { name: "Thakur College of Engineering",    channel: "College"          },
    { name: "Vijaya Sales Tower Offices",       channel: "Corporate Office" },
  ],
  Jogeshwari: [
    { name: "Jogeshwari Gym Zone",              channel: "Gym"              },
    { name: "Western Express Highway Stall",    channel: "Metro Stall"      },
    { name: "Jogeshwari Station Stall",         channel: "Metro Stall"      },
    { name: "Oshiwara Colony Offices",          channel: "Corporate Office" },
    { name: "New English High School Canteen",  channel: "School"           },
  ],
  Ghatkopar: [
    { name: "R-City Mall Food Court",           channel: "Café"             },
    { name: "Ghatkopar Gym Pro",                channel: "Gym"              },
    { name: "Cult.fit Ghatkopar",               channel: "Gym"              },
    { name: "Ghatkopar Station East Stall",     channel: "Metro Stall"      },
    { name: "Ghatkopar Station West Stall",     channel: "Metro Stall"      },
    { name: "VJTI Campus Canteen",              channel: "College"          },
    { name: "Eastern Express Highway Offices",  channel: "Corporate Office" },
  ],
  Mulund: [
    { name: "Nirmal Lifestyle Mall",            channel: "Café"             },
    { name: "Mulund Gym Hub",                   channel: "Gym"              },
    { name: "Fortis Hospital Mulund",           channel: "Hospital"         },
    { name: "Mulund Station Stall",             channel: "Metro Stall"      },
    { name: "KC College of Engineering",        channel: "College"          },
    { name: "LBS Marg Offices",                 channel: "Corporate Office" },
  ],
  Chembur: [
    { name: "Chembur Gym Zone",                 channel: "Gym"              },
    { name: "Diamond Garden Stalls",            channel: "Metro Stall"      },
    { name: "Chembur Station Stall",            channel: "Metro Stall"      },
    { name: "RCF Colony Offices",               channel: "Corporate Office" },
    { name: "Vivekanand College Chembur",       channel: "College"          },
    { name: "Surana Sethia Hospital",           channel: "Hospital"         },
  ],
  Kurla: [
    { name: "Phoenix Marketcity Food Court",    channel: "Café"             },
    { name: "Kurla Gym Plus",                   channel: "Gym"              },
    { name: "Kurla Station CST Side Stall",     channel: "Metro Stall"      },
    { name: "LBS Marg Industrial Offices",      channel: "Corporate Office" },
    { name: "Guru Nanak High School Canteen",   channel: "School"           },
  ],
  Colaba: [
    { name: "Colaba Causeway Stalls",           channel: "Metro Stall"      },
    { name: "Colaba Gym Studio",                channel: "Gym"              },
    { name: "Café Mondegar",                    channel: "Café"             },
    { name: "Leopold Café Area Stalls",         channel: "Café"             },
    { name: "KEM Hospital Colaba Stall",        channel: "Hospital"         },
    { name: "Navy Nagar Offices",               channel: "Corporate Office" },
  ],
  Fort: [
    { name: "Horniman Circle Stalls",           channel: "Metro Stall"      },
    { name: "CST Station Stall",                channel: "Metro Stall"      },
    { name: "Elphinstone College Canteen",      channel: "College"          },
    { name: "Nariman Point Office Towers",      channel: "Corporate Office" },
    { name: "Stock Exchange Canteen",           channel: "Corporate Office" },
    { name: "NSCI Club Gym",                    channel: "Gym"              },
  ],
  Belapur: [
    { name: "CBD Belapur Office Hub",           channel: "Corporate Office" },
    { name: "Belapur Gym Zone",                 channel: "Gym"              },
    { name: "Belapur Station Stall",            channel: "Metro Stall"      },
    { name: "Amity University Navi Mumbai",     channel: "College"          },
    { name: "DY Patil Hospital Belapur",        channel: "Hospital"         },
    { name: "Indiabulls Finance Centre",        channel: "Corporate Office" },
  ],
  Kharghar: [
    { name: "Kharghar Hills Gym",               channel: "Gym"              },
    { name: "Kharghar Station Stall",           channel: "Metro Stall"      },
    { name: "NMIMS Kharghar Campus",            channel: "College"          },
    { name: "Central Park Kharghar Stalls",     channel: "Metro Stall"      },
    { name: "Kharghar Office Towers",           channel: "Corporate Office" },
  ],
  Panvel: [
    { name: "Panvel Gym Hub",                   channel: "Gym"              },
    { name: "Panvel Station Stall",             channel: "Metro Stall"      },
    { name: "NMSIMS Panvel Canteen",            channel: "College"          },
    { name: "MGM Hospital Panvel",              channel: "Hospital"         },
    { name: "CIDCO Township Offices",           channel: "Corporate Office" },
  ],
  Vasai: [
    { name: "Vasai Gym Zone",                   channel: "Gym"              },
    { name: "Vasai Station Stall",              channel: "Metro Stall"      },
    { name: "Vasai Road Station Stall",         channel: "Metro Stall"      },
    { name: "St. John College Vasai",           channel: "College"          },
    { name: "Wada Industrial Offices",          channel: "Corporate Office" },
  ],
  Virar: [
    { name: "Virar Gym Pro",                    channel: "Gym"              },
    { name: "Virar Station Stall",              channel: "Metro Stall"      },
    { name: "Virar (W) Station Stall",          channel: "Metro Stall"      },
    { name: "Tokarsi Smarak School Canteen",    channel: "School"           },
    { name: "Naigaon Industrial Offices",       channel: "Corporate Office" },
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
SEVEN_DAY_TARGET: Sell ${packs} packs in 14 days. That's your full starter stock out the door and ₹${pkg * 1.5} in your pocket.
YOUR_TERRITORY: ${area} is yours — strong demand and low MadSquad seller coverage right now. You're first mover here.
WHAT_TO_STOCK: Lead with Flamin' Fun Puffs Mini — proven gym seller.${office ? ` Add Mighty Masala Bhujia Mini for ${office.name}.` : ""} Both at ₹10, easy impulse buy.
FIRST_MILESTONE: Sell your first ${first} packs to earn your First Win badge + 50 bonus points. Aaj pehle ${first} nikaalo!`;
};
