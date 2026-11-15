// English copy for the public registration site. To add a language, copy this
// file (e.g. hi.ts), translate the values, and register it in i18n/locales.ts.
// Claims here must stay true to documentation/BRD_Partner_Onboarding.md.

export const en = {
  meta: {
    brand: "atomberg",
    brandSuffix: "Partners",
  },
  nav: {
    main: "Main",
    howItWorks: "How it works",
    faqs: "FAQs",
    language: "Language",
  },
  hero: {
    eyebrow: "For technicians and engineers",
    titleStart: "Put your skills to work with",
    titleAccent: "Atomberg.",
    subtitle:
      "Install and repair Atomberg fans, water purifiers, kitchen appliances and smart locks in your area, whether you work on your own or with a team. Register in a few minutes and our team will call you.",
  },
  form: {
    title: "Register as an Atomberg partner",
    nameLabel: "Your full name",
    namePlaceholder: "Enter your full name",
    productsLabel: "Products you can service",
    stateLabel: "State",
    statePlaceholder: "Select state",
    cityLabel: "City",
    cityPlaceholder: "Select city",
    mobileLabel: "Mobile number",
    mobilePlaceholder: "Enter your mobile number",
    mobilePrefix: "+91",
    getOtp: "Get OTP",
    sendingOtp: "Sending OTP…",
    otpLabel: "OTP",
    otpPending: "We'll send a 4-digit OTP to this number.",
    otpSentTo: (mobile: string) => `Sent to +91 ${mobile}.`,
    otpResentTo: (mobile: string) => `Resent to +91 ${mobile}.`,
    changeNumber: "Change",
    resendIn: (seconds: number) => `Resend in ${seconds}s`,
    resend: "Resend OTP",
    submit: "Verify & register",
    submitting: "Registering…",
    loadingMasters: "Loading form…",
    mastersError: "We couldn't load the form.",
    retry: "Try again",
    networkError: "We couldn't reach the server. Check your connection and try again.",
  },
  validation: {
    nameRequired: "Enter your full name.",
    nameLength: "Name must be 3 to 100 characters.",
    nameChars: "Use letters, numbers, spaces and & . - / only.",
    nameLetter: "Name must contain at least one letter.",
    productsRequired: "Select at least one product.",
    stateRequired: "Select your state.",
    cityRequired: "Select your city.",
    mobileInvalid: "Enter a valid 10-digit mobile number starting with 6, 7, 8 or 9.",
    otpInvalid: "Enter the 4-digit OTP.",
  },
  success: {
    title: (name: string) => `Thank you, ${name}!`,
    body: "We've received your registration.",
    referenceLabel: "Your reference number",
    nextTitle: "What happens next",
    next: "Our team will reach out to you for a short screening. Keep your reference number handy.",
  },
  benefits: {
    title: "Why partner with Atomberg",
    items: [
      { title: "Service jobs near you", body: "Get installation and repair jobs from Atomberg customers in your area." },
      { title: "Training by Atomberg", body: "Atomberg trainers train and assess you on every product you service." },
      { title: "Work in your area", body: "Work in and around your own city. Jobs are mapped to your service pincodes." },
      { title: "Paperless onboarding", body: "Documents, agreement and service deposit are all completed online." },
    ],
  },
  steps: {
    title: "Become a partner in 3 easy steps",
    items: [
      { title: "Register with your mobile number", body: "Tell us your name, your city and the products you can service." },
      { title: "Get screened and trained", body: "A short call with our team, then training and an assessment by an Atomberg trainer." },
      { title: "Complete documents and go live", body: "Upload documents, sign the agreement online, pay the service deposit and receive your kit." },
    ],
    cta: "Get started",
    imageAlt: "A trainer briefing technicians in hard hats at a machine",
  },
  network: {
    title: "Join a growing service network",
  },
  testimonials: {
    title: "Hear from our partners",
    previous: "Previous testimonials",
    next: "Next testimonials",
  },
  cta: {
    title: "Become an Atomberg service partner today",
    button: "Get started",
  },
  faq: {
    title: "Frequently asked questions",
    items: [
      {
        q: "How do I become an Atomberg service partner?",
        a: "Register on this page with your name, mobile number, city and the products you can service. If partners are needed in your area, our team will call you for a short screening. After that come screening by the area manager and an Atomberg trainer, training and an assessment, then documents, the agreement and the service deposit. Your account goes live once your kit is delivered and your service pincodes are mapped.",
      },
      {
        q: "Who can register?",
        a: "Anyone who can install and repair home appliances: individual technicians and engineers working on their own, and service firms with a team of technicians.",
      },
      {
        q: "Which products will I service?",
        a: "Atomberg fans, water purifiers, kitchen appliances and smart locks. You choose the products you can service when you register, and you are trained on each one.",
      },
      {
        q: "What documents will I need?",
        a: "None to register. Later, during onboarding, you will need your PAN, Aadhaar, bank account details and email address. Firms will also need a GST number.",
      },
      {
        q: "Is there a fee or deposit?",
        a: "There is no fee to register. A service deposit is paid online before your account goes live. Our team will share the details during onboarding.",
      },
      {
        q: "What happens if there is no requirement in my area right now?",
        a: "We keep your registration on file and contact you when a partner is needed in your area.",
      },
    ],
    more: "More questions? Our team will answer them when they call you after you register.",
  },
  demoGate: {
    title: "Partner onboarding demo",
    subtitle: "Sign in to open this demo.",
    emailLabel: "Email",
    passwordLabel: "Password",
    submit: "Continue",
    checking: "Checking…",
    required: "Enter the email and password.",
    denied: "That email and password don't match.",
  },
  footer: {
    tagline: "Service partner programme",
    website: "atomberg.com",
    copyright: (year: number) => `© ${year} Atomberg Technologies`,
  },
};

export type Messages = typeof en;
