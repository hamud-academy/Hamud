export type DiplomaQuizOptionConfig = {
  text: string;
  isCorrect: boolean;
};

export type DiplomaQuizQuestionConfig = {
  prompt: string;
  options: DiplomaQuizOptionConfig[];
};

export type DiplomaCourseExamConfig = {
  title: string;
  passingScore: number;
  questions: DiplomaQuizQuestionConfig[];
};

export type DiplomaSubjectLessonConfig = {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  documentUrl: string;
  duration: string;
  quiz: { questions: DiplomaQuizQuestionConfig[] };
};

export type DiplomaSubjectModuleConfig = {
  id: string;
  title: string;
  order: number;
  lessons: DiplomaSubjectLessonConfig[];
};

export type DiplomaPlanType = "SLOW" | "SPEEDY" | "EXPRESS" | "ONE_TIME";

export type DiplomaPlanTheme = "orange" | "blue" | "green" | "red";

export type DiplomaPaymentPlanConfig = {
  type: DiplomaPlanType;
  title: string;
  subtitle: string;
  originalPrice: string;
  price: string;
  priceSuffix: string;
  theme: DiplomaPlanTheme;
  courses: string;
  details: string[];
  ctaLabel: string;
  ctaHref: string;
};

export const DIPLOMA_PLAN_TYPES: DiplomaPlanType[] = ["SLOW", "SPEEDY", "EXPRESS", "ONE_TIME"];

export const DIPLOMA_PLAN_LABELS: Record<DiplomaPlanType, string> = {
  SLOW: "Slow Diploma",
  SPEEDY: "Speedy Diploma",
  EXPRESS: "Express Diploma",
  ONE_TIME: "One Time Payments",
};

export const DIPLOMA_PLAN_THEMES: Record<DiplomaPlanType, DiplomaPlanTheme> = {
  SLOW: "orange",
  SPEEDY: "blue",
  EXPRESS: "green",
  ONE_TIME: "red",
};

export function buildDefaultPaymentPlans(coursesLabel: string): DiplomaPaymentPlanConfig[] {
  return [
    {
      type: "SLOW",
      title: "Slow Diploma",
      subtitle: "Waxaad bixinaysaa bilwalba $25",
      originalPrice: "$50",
      price: "$25.00",
      priceSuffix: "/Bishiiba*",
      theme: "orange",
      courses: coursesLabel,
      details: [
        coursesLabel,
        "This is not a Zoom Class",
        "This is On-Demand Video Courses",
        "Minimum 2 hours daily requirement",
        "Students & Teachers WhatsApp Group",
        "12 Months Period from the Start date",
        "Practical Proctored exams",
        "Diploma Administration fee apply",
      ],
      ctaLabel: "HADA DALBO",
      ctaHref: "/contact",
    },
    {
      type: "SPEEDY",
      title: "Speedy Diploma",
      subtitle: "Waxaad bixinaysaa bilwalba $50",
      originalPrice: "$100",
      price: "$50.00",
      priceSuffix: "/Bishiiba*",
      theme: "blue",
      courses: coursesLabel,
      details: [
        coursesLabel,
        "This is not a Zoom Class",
        "This is On-Demand Video Courses",
        "Minimum 4 hours daily requirement",
        "Students & Teachers WhatsApp Group",
        "6 Months Period from the Start date",
        "Practical Proctored exams",
        "Diploma Administration fee apply",
      ],
      ctaLabel: "HADA DALBO",
      ctaHref: "/contact",
    },
    {
      type: "EXPRESS",
      title: "Express Diploma",
      subtitle: "Waxaad bixinaysaa bilwalba $100",
      originalPrice: "$200",
      price: "$100.00",
      priceSuffix: "/Bishiiba*",
      theme: "green",
      courses: coursesLabel,
      details: [
        coursesLabel,
        "This is not a Zoom Class",
        "This is On-Demand Video Courses",
        "Minimum 6 hours daily requirement",
        "Students & Teachers WhatsApp Group",
        "3 - 6 Months Period from the Start date",
        "Practical Proctored exams",
        "Diploma Administration fee apply",
      ],
      ctaLabel: "HADA DALBO",
      ctaHref: "/contact",
    },
    {
      type: "ONE_TIME",
      title: "One Time Payments",
      subtitle: "Halmar Iska wada Bixi $300",
      originalPrice: "$600",
      price: "$300.00",
      priceSuffix: "/Halmar*",
      theme: "red",
      courses: coursesLabel,
      details: [
        coursesLabel,
        "This is not a Zoom Class",
        "This is On-Demand Video Courses",
        "Minimum 6 hours daily requirement",
        "Students & Teachers WhatsApp Group",
        "3 - 6 Months Period from the Start date",
        "Practical Proctored exams",
        "Diploma Administration fee apply",
      ],
      ctaLabel: "HADA DALBO",
      ctaHref: "/contact",
    },
  ];
}

export type DiplomaSubjectConfig = {
  id: string;
  title: string;
  code: string;
  description: string;
  duration: string;
  teacherId: string;
  /** Optional link to a platform course; instructor on that course also gets diploma access */
  courseId: string;
  lessons: DiplomaSubjectLessonConfig[];
  modules: DiplomaSubjectModuleConfig[];
  exam: DiplomaCourseExamConfig;
};

export type DiplomaProgramConfig = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  duration: string;
  courses: string;
  status: "DRAFT" | "PUBLISHED";
  details: string[];
  paymentPlans: DiplomaPaymentPlanConfig[];
  subjects: DiplomaSubjectConfig[];
};

export type DiplomaConfig = {
  spotlightEyebrow: string;
  spotlightTitle: string;
  spotlightDescription: string;
  spotlightFeatures: string[];
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  heroImageUrl: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  programsEyebrow: string;
  programsTitle: string;
  programs: DiplomaProgramConfig[];
};

export const defaultDiplomaConfig: DiplomaConfig = {
  spotlightEyebrow: "DIPLOMA CLASSROOM",
  spotlightTitle: "Learn through structured diploma paths.",
  spotlightDescription:
    "Follow a complete learning plan with organized subjects, assigned teachers, and practical milestones.",
  spotlightFeatures: [
    "Teacher-assigned subjects",
    "Structured learning roadmap",
    "Practical assignments and support",
  ],
  heroEyebrow: "DIPLOMA PROGRAMS",
  heroTitle: "Hamud Diplomas",
  heroDescription:
    "Hamud Diploma waa program loogu talagalay ardayda rabta inay qaataan diploma structured ah, si ay xirfadahooda ugu dhisaan casharro online ah oo nidaamsan.",
  heroImageUrl: "",
  ctaLabel: "Contact Us",
  ctaHref: "/contact",
  secondaryCtaLabel: "View Courses",
  secondaryCtaHref: "/courses",
  programsEyebrow: "AVAILABLE DIPLOMAS",
  programsTitle: "Choose your diploma program",
  programs: [
    {
      id: "computer-literacy",
      title: "Computer Literacy Diploma",
      slug: "computer-literacy-diploma",
      summary: "Build practical computer skills through structured online lessons and guided practice.",
      duration: "4 Months",
      courses: "8 Courses",
      status: "PUBLISHED",
      details: [
        "8 e-Learning courses",
        "4 months period from the start date",
        "This is not a Zoom class",
        "Minimum 2 hours daily requirement",
        "On-demand video courses",
      ],
      paymentPlans: buildDefaultPaymentPlans("8 eLearning Courses"),
      subjects: [
        {
          id: "computer-basics",
          title: "Computer Basics",
          code: "CL-101",
          description: "Operating systems, typing, files, folders, and daily computer use.",
          duration: "4 weeks",
          teacherId: "",
          courseId: "",
          lessons: [],
          modules: [],
          exam: { title: "Computer Basics Final Exam", passingScore: 50, questions: [] },
        },
      ],
    },
    {
      id: "web-design",
      title: "Web Design Diploma",
      slug: "web-design-diploma",
      summary: "Learn modern website design skills from layout fundamentals to real project delivery.",
      duration: "6 Months",
      courses: "9 Courses",
      status: "PUBLISHED",
      details: [
        "Part of digital creative media learning",
        "9 e-Learning courses",
        "6 months period from the start date",
        "Minimum 2 hours daily requirement",
        "On-demand video courses",
      ],
      paymentPlans: buildDefaultPaymentPlans("9 eLearning Courses"),
      subjects: [
        {
          id: "html-css",
          title: "HTML & CSS Foundations",
          code: "WD-101",
          description: "Structure, styling, responsive pages, and practical website layouts.",
          duration: "6 weeks",
          teacherId: "",
          courseId: "",
          lessons: [],
          modules: [],
          exam: { title: "HTML & CSS Final Exam", passingScore: 50, questions: [] },
        },
      ],
    },
    {
      id: "digital-marketing",
      title: "Digital Marketing Diploma",
      slug: "digital-marketing-diploma",
      summary: "Master social media, content planning, campaigns, and digital growth fundamentals.",
      duration: "5 Months",
      courses: "10 Courses",
      status: "PUBLISHED",
      details: [
        "Social media and content planning",
        "Campaign setup and reporting",
        "5 months period from the start date",
        "This is not a Zoom class",
        "Practical assignments included",
      ],
      paymentPlans: buildDefaultPaymentPlans("10 eLearning Courses"),
      subjects: [
        {
          id: "social-media-strategy",
          title: "Social Media Strategy",
          code: "DM-101",
          description: "Planning, content calendars, audience targeting, and reporting.",
          duration: "5 weeks",
          teacherId: "",
          courseId: "",
          lessons: [],
          modules: [],
          exam: { title: "Social Media Strategy Final Exam", passingScore: 50, questions: [] },
        },
      ],
    },
  ],
};
