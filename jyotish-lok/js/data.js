/* Default content. The admin panel saves edits on top of this in the browser. */
window.JL_DEFAULTS = {
  biz: {
    name: "Jyotish Lok",
    legal: "Jay Maa Tara Jyotish Lok",
    astrologer: "Acharya Prabhu Prajapati",
    whatsapp: "919773380099",
    call: "919928089307",
    email: "jyotishlokdarshan@gmail.com",
    address: "R.K. Colony, Ashram Road, Bari Sadri, Chittorgarh, Rajasthan 312403",
    hours: "Mon–Sun · 10:00 am – 8:00 pm",
    instagram: "https://www.instagram.com/jyotishlokdarshan/",
    facebook: "https://www.facebook.com/profile.php?id=61589081645026",
    youtube: "https://youtu.be/3sTvD7rr6DQ",
    playstore: "https://play.google.com/store/apps/details?id=com.codeciya.jyotishlok.user",
    announcement: "Diwali Lakshmi puja bookings are open · Free kundli for every new client this week"
  },
  stats: [
    { value: 50, suffix: "K+", label: "Kundlis generated" },
    { value: 10, suffix: "K+", label: "Happy clients" },
    { value: 24, suffix: "×7", label: "Astrology support" },
    { value: 12, suffix: "+", label: "Pujas performed monthly" }
  ],
  services: [
    { id: "s1", icon: "kundli", title: "Kundli analysis", hi: "कुंडली विश्लेषण", desc: "Your full birth chart read: planets, dasha, yogas and doshas, explained in plain words.", price: 1100, mins: 45, img: "img/kundli.jpg" },
    { id: "s2", icon: "rings", title: "Kundli matching", hi: "कुंडली मिलान", desc: "36 gun matching with manglik and nadi dosha check before marriage.", price: 701, mins: 30, img: "img/havan.jpg" },
    { id: "s3", icon: "hand", title: "Palmistry", hi: "हस्तरेखा ज्ञान", desc: "What the lines of your hand say about life, career and relationships.", price: 701, mins: 30, img: "img/palmistry.jpg" },
    { id: "s4", icon: "house", title: "Vastu consultation", hi: "वास्तु परामर्श", desc: "Vastu for home, shop and office, with remedies that don't need demolition.", price: 2100, mins: 60, img: "img/vastu.jpg" },
    { id: "s5", icon: "brief", title: "Career & finance", hi: "भविष्यवाणी", desc: "Job change, business, property and money timing from your chart.", price: 1100, mins: 45, img: "img/astrologer.jpg" },
    { id: "s6", icon: "cal", title: "Shubh muhurat", hi: "शुभ मुहूर्त", desc: "Auspicious timing for vivah, griha pravesh, vehicle and business opening.", price: 501, mins: 20, img: "img/diya.jpg" }
  ],
  pujas: [
    { id: "p1", title: "Diwali Lakshmi-Ganesh Puja", sub: "Diwali · 8 Nov 2026", desc: "Mahalakshmi and Ganesh puja on the Diwali muhurat for wealth in home and business.", price: 1100, img: "img/diya.jpg", tag: "Upcoming" },
    { id: "p2", title: "Navratri Ashtami Maha Puja", sub: "Maa Harsiddhi · Maa Gadhkalika · Maa Bhadwa Mata", desc: "Special Ashtami puja for the Goddess's blessings, performed in your name.", price: 501, img: "img/navratri.jpg", tag: "" },
    { id: "p3", title: "Saubhagya Karwa Chauth Puja", sub: "For a long and happy marriage", desc: "Puja and chadhava for your husband's long life and a happy married life.", price: 301, img: "img/puja.jpg", tag: "" },
    { id: "p4", title: "Kaal Sarp Dosh Puja", sub: "Performed in Ujjain", desc: "Puja to calm Rahu–Ketu's kaal sarp yog, by experienced pandits.", price: 2100, img: "img/shiva-trishul.jpg", tag: "Popular" },
    { id: "p5", title: "Mangal Dosh Shanti", sub: "For manglik kundlis", desc: "Clears delays in marriage caused by Mangal dosh.", price: 1500, img: "img/havan.jpg", tag: "" },
    { id: "p6", title: "Mahamrityunjaya Jaap", sub: "Health & protection", desc: "1.25 lakh mantra jaap for health, long life and protection.", price: 5100, img: "img/rudraksha.jpg", tag: "" },
    { id: "p7", title: "Pitru Dosh Nivaran", sub: "For ancestors' peace", desc: "Tarpan and pitru shanti for family harmony and blessings.", price: 2100, img: "img/temple.jpg", tag: "" },
    { id: "p8", title: "Navgraha Shanti Puja", sub: "All nine planets", desc: "Balances all nine grahas when the chart shows several doshas.", price: 3100, img: "img/planets.jpg", tag: "" }
  ],
  products: [
    { id: "r1", title: "Gemstone bracelets", desc: "Dhan Yog, Money Magnet, Rose Quartz, Lapis Lazuli and more", price: 491, img: "img/bracelet.jpg" },
    { id: "r2", title: "Malas", desc: "Karungali 108-bead, sandalwood and rudraksha japa malas", price: 791, img: "img/mala.jpg" },
    { id: "r3", title: "Rudraksha", desc: "4 mukhi, 5 mukhi and rare beads, energised before dispatch", price: 399, img: "img/rudraksha.jpg" },
    { id: "r4", title: "Gemstones", desc: "Certified natural ratna chosen from your kundli", price: 0, img: "img/gemstones.jpg" }
  ],
  testimonials: [
    { name: "Priya S.", city: "Udaipur", rating: 5, text: "The kundli milan was explained so patiently. We understood every point before deciding." },
    { name: "Rakesh J.", city: "Chittorgarh", rating: 5, text: "Got the shop vastu done. Simple changes, no breaking walls. Business feels calmer." },
    { name: "Meena P.", city: "Ujjain", rating: 5, text: "Booked Navratri puja online and received the video the same evening. Very trustworthy." },
    { name: "Arjun K.", city: "Jaipur", rating: 4, text: "Career reading on WhatsApp video was clear and practical. The remedies were easy to follow." }
  ],
  blog: [
    { id: "b1", title: "Remedies for Pitru Dosh in your kundli", date: "2026-09-20", img: "img/temple.jpg", excerpt: "How to recognise pitru dosh in a birth chart, and five simple remedies you can start at home.", body: "Pitru dosh appears when the Sun or the 9th house is afflicted by Rahu, Ketu or Saturn. It is often linked with delays, family disputes and blocked progress.\n\nSimple remedies:\n1. Offer water with black sesame to the Sun on Sundays.\n2. Feed crows, cows and dogs on Amavasya.\n3. Perform tarpan during Pitru Paksha.\n4. Light a lamp under a peepal tree on Saturdays.\n5. Get a pitru shanti puja performed in your name.\n\nShare your birth details with us to check whether pitru dosh is present in your chart." },
    { id: "b2", title: "Why worship ancestors during Pitru Paksha?", date: "2026-09-08", img: "img/diya.jpg", excerpt: "The 16 days of Pitru Paksha are set aside for gratitude to our ancestors. Here is what to do on each day.", body: "Pitru Paksha is the dark fortnight of Bhadrapada when ancestors are believed to visit the earthly plane. Shraddh, tarpan and daan done in these days bring their blessings and remove obstacles.\n\nDo shraddh on the tithi your ancestor passed away. If you don't know the tithi, Sarva Pitru Amavasya covers all ancestors." },
    { id: "b3", title: "Diwali 2026: Lakshmi puja muhurat and vidhi", date: "2026-10-20", img: "img/puja.jpg", excerpt: "The best time for Lakshmi–Ganesh puja on 8 November 2026, with a simple step-by-step vidhi.", body: "Diwali falls on Sunday, 8 November 2026. Lakshmi puja is done in pradosh kaal, after sunset, during the sthir lagna.\n\nKeep a clean chowki, a kalash, Lakshmi–Ganesh idols, diyas, kamal gatta, roli, rice and sweets ready. Begin with Ganesh puja, then Lakshmi puja, then Kuber puja, and end with aarti.\n\nWant the puja done in your name? Book it from the Puja section." }
  ],
  gallery: ["img/navratri.jpg", "img/havan.jpg", "img/puja.jpg", "img/temple.jpg", "img/diya.jpg", "img/rudraksha.jpg", "img/vastu.jpg", "img/kundli.jpg"],
  slots: { start: "10:00", end: "19:30", step: 30, closed: [] },
  rashifalOverride: {}
};
