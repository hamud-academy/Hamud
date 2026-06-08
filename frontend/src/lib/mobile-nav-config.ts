import type { TranslationKey } from "@/lib/i18n";

export type MobileNavIcon =
  | "home"
  | "grid"
  | "book"
  | "diploma"
  | "user"
  | "users"
  | "trophy"
  | "quote"
  | "requests"
  | "plus"
  | "settings"
  | "courses"
  | "about"
  | "contact"
  | "login";

export interface MobileNavLink {
  href: string;
  labelKey: TranslationKey;
  icon: MobileNavIcon;
  match?: (pathname: string) => boolean;
}

export interface MobileNavAccentLink extends MobileNavLink {
  /** Circular accent button (brand color) */
  accent?: boolean;
}

function exactOrPrefix(href: string) {
  return (pathname: string) => {
    if (href === "/" || href === "/admin" || href === "/teacher" || href === "/dashboard") {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };
}

export const PUBLIC_MOBILE_NAV = {
  homeHref: "/",
  primary: [
    { href: "/courses", labelKey: "nav.courses", icon: "courses" as const, match: exactOrPrefix("/courses") },
    { href: "/diploma", labelKey: "nav.diploma", icon: "diploma" as const, match: exactOrPrefix("/diploma") },
  ] satisfies MobileNavLink[],
  accent: [
    { href: "/signup", labelKey: "nav.join", icon: "plus" as const, match: exactOrPrefix("/signup"), accent: true },
  ] satisfies MobileNavAccentLink[],
  more: [
    { href: "/about", labelKey: "nav.about", icon: "about" as const, match: exactOrPrefix("/about") },
    { href: "/contact", labelKey: "nav.contact", icon: "contact" as const, match: exactOrPrefix("/contact") },
    { href: "/login", labelKey: "auth.login", icon: "login" as const, match: exactOrPrefix("/login") },
  ] satisfies MobileNavLink[],
};

export const STUDENT_MOBILE_NAV = {
  homeHref: "/dashboard",
  primary: [
    {
      href: "/dashboard/courses",
      labelKey: "nav.myCourses",
      icon: "courses",
      match: exactOrPrefix("/dashboard/courses"),
    },
    {
      href: "/dashboard/diploma",
      labelKey: "nav.diploma",
      icon: "diploma",
      match: exactOrPrefix("/dashboard/diploma"),
    },
  ] satisfies MobileNavLink[],
  trailing: [
    {
      href: "/dashboard/profile",
      labelKey: "nav.profile",
      icon: "user",
      match: exactOrPrefix("/dashboard/profile"),
    },
  ] satisfies MobileNavLink[],
  accent: [] satisfies MobileNavAccentLink[],
  more: [
    { href: "/dashboard/achievements", labelKey: "nav.achievements", icon: "trophy", match: exactOrPrefix("/dashboard/achievements") },
    { href: "/dashboard/testimony", labelKey: "nav.testimony", icon: "quote", match: exactOrPrefix("/dashboard/testimony") },
  ] satisfies MobileNavLink[],
};

export const TEACHER_MOBILE_NAV = {
  homeHref: "/teacher",
  primary: [
    { href: "/teacher/courses", labelKey: "nav.courses", icon: "book", match: exactOrPrefix("/teacher/courses") },
    { href: "/teacher/diploma", labelKey: "nav.diploma", icon: "diploma", match: exactOrPrefix("/teacher/diploma") },
  ] satisfies MobileNavLink[],
  accent: [
    { href: "/teacher/students", labelKey: "nav.students", icon: "users", match: exactOrPrefix("/teacher/students"), accent: true },
  ] satisfies MobileNavAccentLink[],
  more: [
    { href: "/teacher/profile", labelKey: "nav.profile", icon: "user", match: exactOrPrefix("/teacher/profile") },
  ] satisfies MobileNavLink[],
};

export const ADMIN_MOBILE_NAV = {
  homeHref: "/admin",
  primary: [
    { href: "/admin/requests", labelKey: "nav.requests", icon: "requests", match: exactOrPrefix("/admin/requests") },
    { href: "/admin/courses", labelKey: "nav.courses", icon: "courses", match: exactOrPrefix("/admin/courses") },
  ] satisfies MobileNavLink[],
  accent: [
    { href: "/admin/students", labelKey: "nav.students", icon: "users", match: exactOrPrefix("/admin/students"), accent: true },
  ] satisfies MobileNavAccentLink[],
  more: [
    { href: "/admin/courses/new", labelKey: "admin.newCourse", icon: "plus", match: exactOrPrefix("/admin/courses/new") },
    { href: "/admin/diplomas", labelKey: "nav.diploma", icon: "diploma", match: exactOrPrefix("/admin/diplomas") },
    { href: "/admin/accounts", labelKey: "admin.createAccounts", icon: "plus", match: exactOrPrefix("/admin/accounts") },
    { href: "/admin/contact-config", labelKey: "admin.contactConfig", icon: "contact", match: exactOrPrefix("/admin/contact-config") },
    { href: "/admin/footer-config", labelKey: "admin.footerConfig", icon: "settings", match: exactOrPrefix("/admin/footer-config") },
    { href: "/admin/about-config", labelKey: "admin.aboutConfig", icon: "about", match: exactOrPrefix("/admin/about-config") },
    { href: "/admin/settings", labelKey: "admin.settings", icon: "settings", match: exactOrPrefix("/admin/settings") },
    { href: "/admin/categories", labelKey: "admin.categories", icon: "settings", match: exactOrPrefix("/admin/categories") },
    { href: "/admin/system-config/logo", labelKey: "admin.logo", icon: "settings", match: exactOrPrefix("/admin/system-config/logo") },
    { href: "/admin/system-config/name", labelKey: "admin.siteName", icon: "settings", match: exactOrPrefix("/admin/system-config/name") },
    { href: "/admin/system-config/fav-icon", labelKey: "admin.favIcon", icon: "settings", match: exactOrPrefix("/admin/system-config/fav-icon") },
    { href: "/admin/system-config/hero-photo", labelKey: "admin.changeHeroPhoto", icon: "settings", match: exactOrPrefix("/admin/system-config/hero-photo") },
    { href: "/admin/system-config/texts", labelKey: "admin.texts", icon: "settings", match: exactOrPrefix("/admin/system-config/texts") },
    { href: "/admin/system-config/live-lessons-image", labelKey: "admin.liveLessons", icon: "settings", match: exactOrPrefix("/admin/system-config/live-lessons-image") },
    { href: "/admin/system-config/partner-logos", labelKey: "admin.partnerLogos", icon: "settings", match: exactOrPrefix("/admin/system-config/partner-logos") },
    { href: "/admin/system-config/payment-numbers", labelKey: "admin.paymentNumbers", icon: "settings", match: exactOrPrefix("/admin/system-config/payment-numbers") },
  ] satisfies MobileNavLink[],
};

export function isMobileNavItemActive(pathname: string, item: MobileNavLink) {
  return item.match ? item.match(pathname) : exactOrPrefix(item.href)(pathname);
}

export function isMoreMenuActive(pathname: string, items: MobileNavLink[]) {
  return items.some((item) => isMobileNavItemActive(pathname, item));
}

export function isHomeNavActive(pathname: string, homeHref: string) {
  if (homeHref === "/" || homeHref === "/admin" || homeHref === "/teacher" || homeHref === "/dashboard") {
    return pathname === homeHref;
  }
  return isMobileNavItemActive(pathname, { href: homeHref, labelKey: "nav.home", icon: "home" });
}
