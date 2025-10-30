import clsx from 'clsx'
import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '../ui/Button'

interface NavlinksProps {
  link: string,
  href: string,
}

const NavbarLinks: NavlinksProps[] = [
  { link: 'Home', href: '/home' },
  { link: 'Events', href: '/events' },
]
const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className='flex justify-between items-center px-4 relative'>
      <div>
        <Link to="/">
          <img src="/logo.png" alt="logo" height={50} width={150} />
        </Link>
      </div>
      {/* Hamburger for small screens */}
      <button
        className="md:hidden flex flex-col justify-center items-center w-10 h-10 focus:outline-none"
        onClick={() => setMobileOpen((prev) => !prev)}
        aria-label="Toggle menu"
      >
        <span className={clsx(
          'block w-6 h-0.5 bg-primary mb-1 transition-all',
          mobileOpen && 'rotate-45 translate-y-1.5'
        )} />
        <span className={clsx(
          'block w-6 h-0.5 bg-primary mb-1 transition-all',
          mobileOpen && 'opacity-0'
        )} />
        <span className={clsx(
          'block w-6 h-0.5 bg-primary transition-all',
          mobileOpen && '-rotate-45 -translate-y-1.5'
        )} />
      </button>
      {/* Links for medium and up */}
      <div className='hidden md:flex items-center gap-6'>
        {NavbarLinks.map((link, index) => {
          const isActive = location.pathname.startsWith(link.href);
          return (
            <Link
              to={link.href}
              key={index}
              className={clsx(
                'text-md font-semibold text-[#CDCDE0] px-2 py-1 relative',
                isActive && 'text-primary font-bold'
              )}
            >
              <span>{link.link}</span>
              <span
                className={clsx(
                  'block h-0.5 bg-primary absolute left-0 bottom-0 transition-all duration-300',
                  isActive ? 'w-full' : 'w-0'
                )}
              />
            </Link>
          )
        })}
        <Link to="/login">
          <Button variant="primary">Get Started</Button>
        </Link>
      </div>
      {/* Mobile menu dropdown */}
      {mobileOpen && (
        <div className="absolute top-full left-0 w-full bg-[#18181B] flex flex-col items-center gap-4 py-4 z-50 md:hidden shadow-lg animate-fade-in">
          {NavbarLinks.map((link, index) => {
            const isActive = location.pathname.startsWith(link.href);
            return (
              <Link
                to={link.href}
                key={index}
                className={clsx(
                  'text-md font-semibold text-[#CDCDE0] px-2 py-1 relative',
                  isActive && 'text-primary font-bold'
                )}
                onClick={() => setMobileOpen(false)}
              >
                <span>{link.link}</span>
                <span
                  className={clsx(
                    'block h-0.5 bg-primary absolute left-0 bottom-0 transition-all duration-300',
                    isActive ? 'w-full' : 'w-0'
                  )}
                />
              </Link>
            )
          })}
          <Link to="/login" onClick={() => setMobileOpen(false)}>
            <Button variant="primary">Get Started</Button>
          </Link>
        </div>
      )}
    </div>
  )
}

export default Navbar
