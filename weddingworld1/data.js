/**
 * ==========================================================================
 * ROYAL WEDDING INVITATION CONFIGURATION (SINGLE SOURCE OF TRUTH)
 * ==========================================================================
 * Edit ONLY this file to customize the wedding card for any couple!
 * All image and audio paths MUST be relative (e.g. "./assets/...")
 */

const weddingData = {
  // 1. SEO & Browser Meta
  seo: {
    title: "Ananya & Rahul — Royal Wedding Invitation",
    description: "You are cordially invited with family and friends to celebrate the wedding ceremonies of Ananya & Rahul.",
    image: "./assets/images/couple/couple.jpg",
    themeColor: "#4a0e17"
  },

  // 2. Global Feature Toggles
  features: {
    door: true,
    countdown: true,
    story: true,
    timeline: true,
    gallery: true,
    family: true,
    venue: true,
    moments: true,
    music: true,
    sharing: true
  },

  // 3. Divine Blessings & Traditional Invocation
  blessings: {
    ganeshShloka: "With the Divine Blessings of the Almighty",
    kuldevataShloka: "With the Blessings of Our Elders & Ancestors",
    mainShloka: "Two lives, two hearts, joined together in friendship, united forever in love.",
    subShloka: "May our new journey be blessed with eternal happiness, peace, and prosperity.",
    meaning: "May divine grace illuminate our sacred union with everlasting joy, harmony, and togetherness."
  },

  // 4. Couple Information & Family Heritage
  couple: {
    bride: {
      salutation: "",
      name: "Ananya Sharma",
      shortName: "Ananya",
      role: "The Bride",
      image: "./assets/images/bride/bride.jpg",
      parents: "Daughter of Mrs. Sunita & Mr. Rajesh Sharma",
      bio: "Daughter of Mrs. Sunita & Mr. Rajesh Sharma",
      paternalLineage: "Granddaughter of Late Mrs. Kausalya & Late Mr. Omprakash Sharma",
      maternalLineage: "Maternal Granddaughter of Mrs. Shanti & Mr. Madhav Prasad"
    },

    groom: {
      salutation: "",
      name: "Rahul Verma",
      shortName: "Rahul",
      role: "The Groom",
      image: "./assets/images/groom/groom.jpg",
      parents: "Son of Mrs. Meenakshi & Mr. Suresh Verma",
      bio: "Son of Mrs. Meenakshi & Mr. Suresh Verma",
      paternalLineage: "Grandson of Mrs. Savitri & Mr. Raghunath Verma",
      maternalLineage: "Maternal Grandson of Late Mrs. Kamla & Late Mr. Harishankar Gupta"
    },

    coupleImage: "./assets/images/couple/couple.jpg",
    weddingDate: "2027-02-14", // Format: YYYY-MM-DD for countdown calculator
    displayDate: "Sunday, 14 February 2027",
    weddingTime: "10:00 AM onwards (Auspicious Ceremony: 10:45 AM)",
    muhurthamTime: "10:45 AM",
    venueName: "The Grand Heritage Palace, Bengaluru",
    tagline: "Two souls, two families, united in sacred love and marriage.",
    invitationPretext: "With the divine blessings of our ancestors & beloved families",
    invitationText: "We cordially invite you with family and friends to grace the wedding ceremonies of our beloved children and bestow your loving blessings on the couple."
  },

  // 5. Our Story / Milestones (Scrapbook)
  story: {
    enabled: true,
    title: "Our Sacred Journey",
    subtitle: "A Bond Blessed by Destiny",
    introduction: "From our first meeting over conversation in Bangalore to a lifetime of shared dreams and sacred vows, we celebrate the divine journey leading us to the wedding altar.",
    milestones: [
      {
        year: "2022",
        title: "Where It All Began",
        subtitle: "The First Chapter",
        description: "A chance meeting at an art exhibition in Bangalore turned into hours of heartfelt conversation about classical art, heritage, and dreams for the future.",
        image: "./assets/images/gallery/story-01.jpg"
      },
      {
        year: "2024",
        title: "The Golden Proposal",
        subtitle: "Lake Pichola, Udaipur",
        description: "Under the golden evening skies of Udaipur, surrounded by candlelit lanterns and the gentle ripples of Lake Pichola, Rahul asked the question that changed forever.",
        image: "./assets/images/gallery/story-02.jpg"
      },
      {
        year: "2026",
        title: "The Auspicious Engagement",
        subtitle: "United by Blessings",
        description: "Surrounded by our immediate families and divine traditional rituals, we sealed our promise with ancestral blessings, family love, and pure joy.",
        image: "./assets/images/gallery/story-03.jpg"
      }
    ]
  },

  // 6. Wedding Ceremonies & Timeline
  events: [
    {
      id: "mehndi",
      title: "Mehndi Celebration & Welcome Gala",
      shortTitle: "Mehndi",
      date: "2027-02-12",
      displayDate: "Friday, 12 February 2027",
      startTime: "16:00",
      endTime: "20:00",
      displayTime: "4:00 PM – 8:00 PM",
      venue: "Royal Peacock Courtyard",
      address: "The Grand Heritage Palace, Palace Road, Bengaluru",
      description: "Commencing the wedding celebrations with an enchanting afternoon of fragrant henna patterns, traditional folk melodies, celebratory rhythms, and festive delicacies.",
      image: "./assets/images/events/mehndi.jpg",
      icon: "fa-solid fa-paintbrush",
      dressCode: "Festive Green & Floral Traditional",
      showImage: true,
      showMap: true,
      showCalendar: true,
      map: {
        latitude: 12.9982,
        longitude: 77.5921,
        googleMapsUrl: "https://maps.google.com/?q=Bangalore+Palace"
      },
      calendar: {
        enabled: true,
        title: "Ananya & Rahul — Mehndi Celebration",
        description: "Join us for henna ceremonies, live music, and festive celebrations.",
        location: "Royal Peacock Courtyard, Palace Road, Bengaluru"
      }
    },
    {
      id: "haldi",
      title: "Haldi & Floral Ceremony",
      shortTitle: "Haldi",
      date: "2027-02-13",
      displayDate: "Saturday, 13 February 2027",
      startTime: "09:30",
      endTime: "13:00",
      displayTime: "9:30 AM – 1:00 PM",
      venue: "Marigold Floral Pavilion",
      address: "The Grand Heritage Palace, Palace Road, Bengaluru",
      description: "An auspicious morning ritual of applying fragrant turmeric paste, sandalwood, and rose petals amidst traditional songs and blessings to invoke radiance, health, and joy.",
      image: "./assets/images/events/haldi.jpg",
      icon: "fa-solid fa-sun",
      dressCode: "Shades of Auspicious Yellow & Mustard",
      showImage: true,
      showMap: true,
      showCalendar: true,
      map: {
        latitude: 12.9982,
        longitude: 77.5921,
        googleMapsUrl: "https://maps.google.com/?q=Bangalore+Palace"
      },
      calendar: {
        enabled: true,
        title: "Ananya & Rahul — Haldi Ceremony",
        description: "A joyful morning of turmeric blessings, marigolds, and celebration.",
        location: "Marigold Floral Pavilion, Palace Road, Bengaluru"
      }
    },
    {
      id: "sangeet",
      title: "Sangeet Musical Gala Night",
      shortTitle: "Sangeet",
      date: "2027-02-13",
      displayDate: "Saturday, 13 February 2027",
      startTime: "19:00",
      endTime: "23:30",
      displayTime: "7:00 PM – 11:30 PM",
      venue: "The Grand Crystal Ballroom",
      address: "The Grand Heritage Palace, Palace Road, Bengaluru",
      description: "An exuberant evening of choreographed dance performances, live classical fusion symphony, energetic celebratory music, and a lavish royal dinner banquet.",
      image: "./assets/images/events/sangeet.jpg",
      icon: "fa-solid fa-music",
      dressCode: "Glamorous Royal Evening Couture & Indo-Western",
      showImage: true,
      showMap: true,
      showCalendar: true,
      map: {
        latitude: 12.9982,
        longitude: 77.5921,
        googleMapsUrl: "https://maps.google.com/?q=Bangalore+Palace"
      },
      calendar: {
        enabled: true,
        title: "Ananya & Rahul — Sangeet Celebration",
        description: "An unforgettable evening of dance performances, music, and royal feast.",
        location: "The Grand Crystal Ballroom, Bengaluru"
      }
    },
    {
      id: "wedding",
      title: "The Sacred Wedding Ceremony",
      shortTitle: "Wedding",
      date: "2027-02-14",
      displayDate: "Sunday, 14 February 2027",
      startTime: "10:00",
      endTime: "14:30",
      displayTime: "10:00 AM – 2:30 PM (Auspicious Ceremony: 10:45 AM)",
      venue: "Mandapam of Lights",
      address: "The Grand Heritage Palace, Palace Road, Bengaluru",
      description: "The supreme sacred wedding union: Procession arrival, floral garland exchange, sacred vows around the holy flame, wedding knot tying, and family blessings, followed by Traditional Wedding Banquet.",
      image: "./assets/images/events/wedding.jpg",
      icon: "fa-solid fa-fire",
      dressCode: "Traditional Royal Silk & Elegant Festive Wear",
      showImage: true,
      showMap: true,
      showCalendar: true,
      map: {
        latitude: 12.9982,
        longitude: 77.5921,
        googleMapsUrl: "https://maps.google.com/?q=Bangalore+Palace"
      },
      calendar: {
        enabled: true,
        title: "Ananya & Rahul — Sacred Wedding Ceremony",
        description: "Witness the sacred wedding vows and shower the newlyweds with your blessings.",
        location: "Mandapam of Lights, The Grand Heritage Palace, Bengaluru"
      }
    },
    {
      id: "reception",
      title: "Grand Wedding Reception",
      shortTitle: "Reception",
      date: "2027-02-15",
      displayDate: "Monday, 15 February 2027",
      startTime: "19:00",
      endTime: "23:00",
      displayTime: "7:00 PM – 11:00 PM",
      venue: "The Heritage Royal Lawns",
      address: "The Grand Heritage Palace, Palace Road, Bengaluru",
      description: "An opulent gala evening under the starlit sky to greet and congratulate the newlyweds, accompanied by live instrumental orchestra and a bespoke culinary feast.",
      image: "./assets/images/events/reception.jpg",
      icon: "fa-solid fa-champagne-glasses",
      dressCode: "Royal Formal & Tuxedo / Elegant Silk Attire",
      showImage: true,
      showMap: true,
      showCalendar: true,
      map: {
        latitude: 12.9982,
        longitude: 77.5921,
        googleMapsUrl: "https://maps.google.com/?q=Bangalore+Palace"
      },
      calendar: {
        enabled: true,
        title: "Ananya & Rahul — Grand Reception",
        description: "Celebrate the newlyweds with dinner, drinks, and live music.",
        location: "The Heritage Royal Lawns, Palace Road, Bengaluru"
      }
    }
  ],

  // 7. Editorial Photo Gallery
  gallery: {
    enabled: true,
    title: "Moments in Time",
    subtitle: "Precious memories from our journey so far",
    images: [
      {
        src: "./assets/images/gallery/gallery-01.jpg",
        caption: "Golden hour promises under the whispering banyans"
      },
      {
        src: "./assets/images/gallery/gallery-02.jpg",
        caption: "A quiet moment of laughter and vibrant celebrations"
      },
      {
        src: "./assets/images/gallery/gallery-03.jpg",
        caption: "Traditional turmeric blessings and festive yellow blooms"
      },
      {
        src: "./assets/images/gallery/gallery-04.jpg",
        caption: "Two hearts dancing to the same joyous rhythm"
      },
      {
        src: "./assets/images/gallery/gallery-05.jpg",
        caption: "Sacred vows by the holy flame in the palace mandapam"
      },
      {
        src: "./assets/images/gallery/gallery-06.jpg",
        caption: "Starlit celebrations at the royal palace reception gala"
      }
    ]
  },

  // 8. Family Heritage & Blessings
  family: {
    enabled: true,
    title: "Family Blessings",
    subtitle: "United in Love, Respect & Gratitude",
    brideSide: {
      title: "Bride's Family (Sharma Family)",
      sections: [
        {
          heading: "Cordially Invited By (Parents)",
          members: [
            "Mrs. Sunita & Mr. Rajesh Sharma (Parents)"
          ]
        },
        {
          heading: "With the Blessings of Grandparents",
          members: [
            "Late Mrs. Kausalya & Late Mr. Omprakash Sharma (Paternal Grandparents)",
            "Mrs. Shanti & Mr. Madhav Prasad (Maternal Grandparents)"
          ]
        },
        {
          heading: "With Best Compliments (Family & Relatives)",
          members: [
            "Mr. Siddharth Sharma (Brother)",
            "Mrs. Rekha & Mr. Arvind Sharma (Uncle & Aunt)",
            "Mrs. Pooja & Mr. Manoj Tiwari (Uncle & Aunt)",
            "Mrs. Anita & Mr. Rakesh Prasad (Maternal Uncle & Aunt)",
            "All Near & Dear Relatives & Friends"
          ]
        },
        {
          heading: "With Affection From",
          members: [
            "Aarav, Diya, Anvi & Kabir (Nieces & Nephews)"
          ]
        }
      ]
    },
    groomSide: {
      title: "Groom's Family (Verma Family)",
      sections: [
        {
          heading: "Cordially Invited By (Parents)",
          members: [
            "Mrs. Meenakshi & Mr. Suresh Verma (Parents)"
          ]
        },
        {
          heading: "With the Blessings of Grandparents",
          members: [
            "Mrs. Savitri & Mr. Raghunath Verma (Paternal Grandparents)",
            "Late Mrs. Kamla & Late Mr. Harishankar Gupta (Maternal Grandparents)"
          ]
        },
        {
          heading: "With Best Compliments (Family & Relatives)",
          members: [
            "Dr. Priyanka Verma & Mr. Amit Kapoor (Sister & Brother-in-law)",
            "Mrs. Anjali & Mr. Vikram Verma (Uncle & Aunt)",
            "Mrs. Geeta & Mr. Alok Verma (Uncle & Aunt)",
            "Mrs. Vandana & Mr. Deepak Gupta (Maternal Uncle & Aunt)",
            "All Near & Dear Relatives & Friends"
          ]
        },
        {
          heading: "With Affection From",
          members: [
            "Reyansh, Vihaan, Myra & Ishaan (Nieces & Nephews)"
          ]
        }
      ]
    }
  },

  // 9. Venue & Destination
  venue: {
    enabled: true,
    sectionTitle: "Celebration Destination",
    name: "The Grand Heritage Palace & Resort",
    address: "Palace Road, Vasanth Nagar, Bengaluru, Karnataka 560052",
    latitude: 12.9982,
    longitude: 77.5921,
    googleMapsUrl: "https://maps.google.com/?q=Bangalore+Palace",
    image: "./assets/images/events/venue.jpg",
    accommodations: "Complimentary luxury valet parking & guest hospitality desk available at the North Palace Gate."
  },

  // 10. Background Music Configuration
  music: {
    enabled: true,
    autoplayAfterInteraction: true,
    source: "./assets/audio/wedding-song.mp3",
    title: "Royal Instrumental Harmony",
    loop: true,
    volume: 0.45
  },

  // 11. Final Wedding Invitation & RSVP
  finalMessage: {
    title: "Your Gracious Presence is Our Greatest Blessing",
    description: "We eagerly look forward to welcoming you and your family to celebrate this joyful union. Please grace the wedding ceremonies with your presence and bless Ananya & Rahul as they begin their new journey together.",
    signature: "Cordially Invited by:\nSharma & Verma Families",
    thankYouText: "RSVP & Hospitality:\nRajesh Sharma: +91 98765 43210  |  Suresh Verma: +91 98765 43211",
    rsvpContacts: [
      { name: "Mr. Rajesh Sharma", phone: "+91 98765 43210" },
      { name: "Mr. Suresh Verma", phone: "+91 98765 43211" }
    ]
  }
};


