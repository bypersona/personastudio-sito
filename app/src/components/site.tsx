import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { LINKS } from "../lib/client";
export function Background() {
  return <div className="ps-bg" aria-hidden="true" />;
}

export function Nav() {
  return (
    <header className="relative z-20">
      <div className="mx-auto flex h-[72px] w-full max-w-[1400px] items-center justify-between px-6 md:px-10">
        <Link to="/" className="ps-nav-logo flex items-center" aria-label="PERSONA, home">
          <img src="/assets/persona-logo.png" alt="PERSONA" className="h-[34px] w-auto" />
        </Link>
        <a href={LINKS.portal} className="ps-btn ps-btn-sm" rel="noreferrer">
          Log In
        </a>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="relative z-20 mt-auto">
      <div className="mx-auto w-full max-w-[1400px] px-6 md:px-10">
        <div className="flex flex-row items-center justify-between gap-4 border-t border-[#080404]/15 py-6">
          <span className="ps-sans text-[12px] text-[#080404]/60">© 2026 “PERSONA”. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <a href={LINKS.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="ps-social">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.2 8h4.6v14H.2V8zm7.6 0h4.4v1.9h.1c.6-1.1 2.1-2.3 4.3-2.3 4.6 0 5.4 3 5.4 6.9V22h-4.6v-6.7c0-1.6 0-3.7-2.3-3.7s-2.6 1.8-2.6 3.6V22H7.8V8z" />
              </svg>
            </a>
            <a href={LINKS.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="ps-social">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function Page({
  children,
  className = "",
  hideFooter,
  hideNav,
}: {
  children: ReactNode;
  className?: string;
  hideFooter?: boolean;
  hideNav?: boolean;
}) {
  return (
    <div className={`ps-root ps-page relative flex min-h-dvh flex-col ${className}`}>
      <Background />
      {hideNav ? null : <Nav />}
      {children}
      {hideFooter ? null : <Footer />}
    </div>
  );
}

export function BackLink({ href, label = "Back" }: { href: string; label?: string }) {
  return (
    <a href={href} className="ps-back">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square">
        <path d="M19 12H5M11 6l-6 6 6 6" />
      </svg>
      <span>{label}</span>
    </a>
  );
}

export function Button({
  href,
  to,
  onClick,
  children,
  variant = "dark",
  size = "md",
  disabled,
  external,
  type,
}: {
  href?: string;
  to?: string;
  onClick?: () => void;
  children: ReactNode;
  variant?: "dark" | "red" | "ghost";
  size?: "sm" | "md";
  disabled?: boolean;
  external?: boolean;
  type?: "button" | "submit";
}) {
  const cls = `ps-btn ${variant === "red" ? "ps-btn-red" : variant === "ghost" ? "ps-btn-ghost" : ""} ${size === "sm" ? "ps-btn-sm" : ""}`;
  if (to) {
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={cls} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
        {children}
      </a>
    );
  }
  return (
    <button type={type ?? "button"} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}
