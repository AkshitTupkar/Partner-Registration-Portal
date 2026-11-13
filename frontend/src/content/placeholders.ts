// PLACEHOLDER CONTENT. Every image, figure and partner quote here is a stand-in
// and must be replaced with real, approved content before launch.
// Photos are free Unsplash stock (Unsplash License), saved in frontend/public/images
// so the page doesn't depend on a third-party host. Partner names are made up.

export const IMAGES = {
  // Electrician wiring a junction box (unsplash.com, photo-1621905251918)
  hero: "/images/hero-electrician.webp",
  // Trainer with a clipboard briefing trainees in hard hats at a machine (photo-1690356107597)
  steps: "/images/steps-training.webp",
};

export const NETWORK = {
  items: [
    { image: "/images/network-partners.webp", value: "1,000+", label: "Service partners" },
    { image: "/images/network-cities.webp", value: "500+", label: "Cities covered" },
    { image: "/images/network-visits.webp", value: "10 Lakh+", label: "Service visits" },
    // 2×2 collage of the four real product photos (fan, water purifier, kitchen, smart lock)
    { image: "/images/network-products.webp", value: "4", label: "Product categories" },
  ],
};

export const TESTIMONIALS = {
  items: [
    {
      quote:
        "Registering took a few minutes. The training covered every product I service, and the jobs come from customers in my own area.",
      name: "Rohan Deshmukh",
      role: "Technician, Pune",
      avatar: "/images/partner-rohan.webp",
    },
    {
      quote:
        "I was worried about the paperwork, but the documents and agreement were all done on my phone. The team guided me at every step.",
      name: "Vikram Sharma",
      role: "Engineer, Jaipur",
      avatar: "/images/partner-vikram.webp",
    },
    {
      quote:
        "Adding water purifiers to the fans I already service has kept me busy all year.",
      name: "Karthik Subramanian",
      role: "Technician, Coimbatore",
      avatar: "/images/partner-karthik.webp",
    },
    {
      quote: "The assessment after training gave me confidence that I can handle any Atomberg product on a visit.",
      name: "Alok Srivastava",
      role: "Service firm owner, Lucknow",
      avatar: "/images/partner-alok.webp",
    },
  ],
};
