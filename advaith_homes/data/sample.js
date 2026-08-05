// ============================================================
//  Advaith Homes — Sample Page Data
//  Use this as a template to see all available features
//  URL: pages/detail.html?page=sample
// ============================================================

var SAMPLE_DATA = {
  page: {
    title: "Sample Feature Showcase | Advaith Homes",
    metaDescription: "Explore all the dynamic components available for Advaith Homes detail pages.",
    
    // 1. Hero Section
    hero: {
      eyebrow: "Feature Showcase",
      headline: "The Complete <em>Buyer's Toolkit</em>",
      subtext: "This page demonstrates every component available in our dynamic detail page template, including banners, comparison tables, and more.",
      stats: [
        { num: "10+", label: "Dynamic Components" },
        { num: "100%", label: "Responsive Design" },
        { num: "0", label: "Coding Required" }
      ]
    },

    // 2. Optional Banner Section
    banner: {
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200",
      title: "Premium Property Research",
      text: "Our research reports provide deep insights into property history, neighborhood safety, and investment potential."
    },

    // 3. Challenges Section
    challengesTitle: "Our Process",
    challengesHeadline: "Overcoming Search Friction",
    challenges: [
      {
        phase: "Phase 1: Discovery", icon: "🔍",
        items: [
          "Initial consultation and requirement gathering",
          "Budget analysis and financial planning",
          "Location and lifestyle mapping"
        ]
      },
      {
        phase: "Phase 2: Acquisition", icon: "🏘️",
        items: [
          "Off-market property sourcing",
          "Professional viewings and appraisals",
          "Aggressive price negotiation"
        ]
      }
    ],

    // 4. Process Timeline (NEW)
    process: {
      tag: "The Method",
      headline: "From Search to Keys",
      steps: [
        { title: "Step 1", desc: "This is a sample process description." },
        { title: "Step 2", desc: "This demonstrates how the timeline flows." },
        { title: "Step 3", desc: "Each step has a dot and a line connecting them." }
      ]
    },

    // 5. Comparison Table (NEW)
    table: {
      tag: "Service Tiers",
      headline: "Compare Our Report Packages",
      columns: ["Features", "Comprehensive", "Standard", "Basic"],
      rows: [
        {
          category: "Comparable Listings",
          items: [
            { name: "Recent Sales", desc: "Data on similar properties sold nearby", values: [true, true, false] },
            { name: "Available for Sale", desc: "Current market competition", values: [true, true, false] },
            { name: "For Rent", desc: "Investment yield potential", values: [true, false, false] }
          ]
        },
        {
          category: "Nearby Schools",
          items: [
            { name: "Ofsted Ratings", values: [true, true, false] },
            { name: "School Catchment Area", values: [true, false, false] }
          ]
        },
        {
          category: "Transport Connections",
          items: [
            { name: "Access Type (Road, Rail)", values: [true, true, true] },
            { name: "Distance Maps", values: [true, false, false] }
          ]
        }
      ]
    },

    // 6. Testimonials (NEW)
    testimonials: [
      { text: "This is a sample testimonial showing the serif typography.", author: "John Doe", location: "Sample City" }
    ],

    // 7. Commitment Section (Do/Don't)
    commitmentTitle: "Our Promise",
    commitmentHeadline: "Integrity in Every Transaction",
    whatWeDo: {
      do: [
        "Provide 100% transparent advice",
        "Save you time and unnecessary stress",
        "Protect your financial interests"
      ],
      dont: [
        "Take commissions from sellers",
        "Ignore potential property red flags",
        "Pressure you into a quick sale"
      ]
    },

    // 6. FAQ Section
    faqTitle: "Common Questions",
    faqHeadline: "Everything You Need to Know",
    commonQuestions: [
      { q: "How long does the setup process take?", a: "Typically, we can get started within 24-48 hours of your initial consultation." },
      { q: "Is there a long-term commitment?", a: "No, we offer flexible terms to suit your specific search requirements." }
    ],

    // 7. CTA Section
    cta: {
      headline: "Ready to Start Your Journey?",
      subtext: "Contact our team today to discuss how we can help you find your dream home.",
      buttonText: "Get Started Now →",
      buttonUrl: "../contact.html"
    }
  }
};
