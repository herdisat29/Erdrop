import * as React from "react"

export function PremiumLogo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <path d="M12 2L15 8L21 9L17 14L18 20L12 17L6 20L7 14L3 9L9 8L12 2Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.3"/>
      <path d="M12 22C12 22 19 16 19 12C19 8.13401 15.866 5 12 5C8.13401 5 5 8.13401 5 12C5 16 12 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function ErdropLogo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
      <rect width="24" height="24" rx="6" fill="currentColor"/>
      <path d="M12 18.5C15.5899 18.5 18.5 15.5899 18.5 12C18.5 8.41015 12 4.5 12 4.5C12 4.5 5.5 8.41015 5.5 12C5.5 15.5899 8.41015 18.5 12 18.5Z" fill="white"/>
      <path d="M10.5 14C10.5 14 11.5 15.5 13.5 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
