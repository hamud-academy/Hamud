export type LiveClassConfig = {
  id: string;
  title: string;
  badge: string;
  imageUrl: string;
  duration: string;
  delivery: string;
  date: string;
  time: string;
  price: string;
  paymentText: string;
  buttonLabel: string;
  buttonHref: string;
  features: string[];
};

export const defaultLiveLessonsConfig = {
  heroImageUrl: "",
  classroomEyebrow: "LIVE CLASSROOM",
  classroomTitle: "Learn live with expert instructors.",
  classroomDescription:
    "Join scheduled lessons, ask questions, and stay connected with your teacher and classmates.",
  classroomFeatures: [
    "Interactive teacher sessions",
    "Real-time questions and answers",
    "Recorded lesson support",
    "Focused study schedules",
  ],
  introEyebrow: "LIVE LESSONS",
  introTitle: "Attend live lessons and learn directly with teachers.",
  introDescription:
    "Live lessons help students stay consistent, get instant feedback, and understand topics faster.",
  primaryButtonLabel: "Find Courses",
  primaryButtonHref: "/courses",
  secondaryButtonLabel: "Contact Us",
  secondaryButtonHref: "/contact",
  classesEyebrow: "UPCOMING LIVE CLASSES",
  classesTitle: "Choose your next live lesson",
  classes: [
    {
      id: "web-development",
      title: "Web Development Bootcamp",
      badge: "WEB",
      imageUrl: "",
      duration: "4 Months",
      delivery: "Zoom",
      date: "01 June 2026",
      time: "Saturday - 18:00 - 21:00",
      price: "$120",
      paymentText: "One Time Payment",
      buttonLabel: "Hada Dalbo",
      buttonHref: "/contact",
      features: [
        "HTML, CSS, JavaScript fundamentals",
        "React and modern frontend skills",
        "Practical website projects",
        "Lifetime access to class materials",
      ],
    },
    {
      id: "digital-marketing",
      title: "Digital Marketing Live Class",
      badge: "DM",
      imageUrl: "",
      duration: "3 Months",
      delivery: "Zoom",
      date: "08 June 2026",
      time: "Wednesday - 18:00 - 21:00",
      price: "$100",
      paymentText: "One Time Payment",
      buttonLabel: "Hada Dalbo",
      buttonHref: "/contact",
      features: [
        "Social media marketing strategy",
        "Content creation and planning",
        "Campaign setup and reporting",
        "Recorded lesson support",
      ],
    },
    {
      id: "graphic-design",
      title: "Graphic Design Masterclass",
      badge: "GD",
      imageUrl: "",
      duration: "3 Months",
      delivery: "Zoom",
      date: "15 June 2026",
      time: "Monday - 18:00 - 21:00",
      price: "$100",
      paymentText: "One Time Payment",
      buttonLabel: "Hada Dalbo",
      buttonHref: "/contact",
      features: [
        "Branding and layout principles",
        "Poster and social media designs",
        "Portfolio-ready projects",
        "Teacher-guided feedback",
      ],
    },
  ] satisfies LiveClassConfig[],
};

export type LiveLessonsConfig = typeof defaultLiveLessonsConfig;
