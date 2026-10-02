export const eventConfig = {
  name: "GRAND DANDIYA RAAS",
  presenter: "SARN GROUP PRESENTS",
  tagline: "“Dandiya Ki Dhoom, Masti Ke Saath”",
  date: "2026-10-18T18:00:00+05:30", // Oct 18, 2026
  displayDate: "18 OCTOBER 2026",
  venue: {
    name: "Beside Kushwaha Bhawan",
    sub: "Bundu, Ranchi, Jharkhand (Near Tau Ground)",
    mapLink: "https://maps.app.goo.gl/49bVuMT775WNLZBD8",
    embedLink: "https://maps.google.com/maps?q=Kushwaha+Bhawan,+Bundu,+Ranchi,+Jharkhand&t=&z=15&ie=UTF8&iwloc=&output=embed",
  },
  contacts: [
    "9122729530",
    "6200986216",
    "7903338065"
  ],
  highlights: [
    {
      id: "anchor",
      title: "Anchor",
      description: "Engaging and energetic hosting to keep the crowd alive.",
      icon: "Mic2"
    },
    {
      id: "dj",
      title: "Live DJ & Traditional Garba",
      description: "Experience the perfect blend of traditional Garba and modern beats.",
      icon: "Music"
    },
    {
      id: "photography",
      title: "Photography",
      description: "Capture your best moments with our professional photographers.",
      icon: "Camera"
    },
    {
      id: "food",
      title: "Food",
      description: "Delicious culinary delights to keep you energized all night.",
      icon: "Utensils"
    },
    {
      id: "dandiya",
      title: "Free Dandiya",
      description: "Complimentary Dandiya sticks provided with your pass.",
      icon: "Wand2"
    }
  ],
  passes: [
    {
      id: "single",
      name: "SINGLE",
      price: 299,
      capacity: 1,
      description: "Entry for 1 Person",
      highlight: false
    },
    {
      id: "couple",
      name: "DUO / COUPLE",
      price: 499,
      capacity: 2,
      description: "Entry for 2 Persons",
      highlight: true
    },
    {
      id: "group",
      name: "GROUP OF 6",
      price: 1499,
      capacity: 6,
      description: "Entry for 6 Persons",
      highlight: false
    },
    {
      id: "child",
      name: "CHILD",
      price: 100,
      capacity: 1,
      description: "Entry for Kids (6-10 Yrs)",
      highlight: false
    }
  ],
  kidsPricing: {
    freeMaxAge: 5, // 1-5 Free
    childMinAge: 6,
    childMaxAge: 10,
    childPrice: 100 // 6-10 Rs 100
  },
  sponsors: [
    { id: 's1', name: 'SPONSOR NAME', role: 'TITLE SPONSOR' },
    { id: 's2', name: 'BRAND PARTNER', role: 'CO-SPONSOR' },
    { id: 's3', name: 'EVENT PARTNER', role: 'POWERED BY' },
    { id: 's4', name: 'FOOD PARTNER', role: 'ASSOCIATE' },
  ]
};
