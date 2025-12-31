'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SideNavigation() {
    const pathname = usePathname();

    const navItems = [
        { name: 'Home', href: '/', icon: '⭐' },     // Using Star for Home per ref
        { name: 'Vocabulary', href: '/vocabulary', icon: '📖' }, // Re-mapped for clarity
        { name: 'Practice', href: '/practice', icon: '🌱' },
        { name: 'Awards', href: '/awards', icon: '🏆' },
        { name: 'Profile', href: '/profile', icon: '🎒' },
    ];

    return (
        <nav className="fixed left-0 top-0 h-full w-56 p-4 z-50 flex flex-col bg-[#FDFBF7]"> {/* Reduced width and padding */}

            {/* Brand Logo */}
            <div className="mb-8 px-2 flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-[#4A6D51] tracking-tight">
                    MojoWords<span className="text-[#F4B9B2] text-2xl">✨</span>
                </h1>
            </div>

            <ul className="space-y-1 flex-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-bold text-sm group
                  ${isActive
                                        ? 'bg-[#A2D8A2] text-white shadow-[0_2px_10px_-2px_rgba(162,216,162,0.6)]'
                                        : 'text-[#8A8A8A] hover:bg-white hover:text-[#4A6D51] hover:shadow-sm'
                                    }`}
                            >
                                <span className={`text-lg transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                    {item.icon}
                                </span>
                                {item.name}
                            </Link>
                        </li>
                    );
                })}
            </ul>



        </nav>
    );
}
