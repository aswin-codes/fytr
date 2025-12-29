import { useState, useEffect } from 'react';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? 'bg-background-dark/95 backdrop-blur-md border-b border-border-dark'
                    : 'bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-background-dark text-xl font-bold">G</span>
                        </div>
                        <span className="text-2xl font-bold text-textPrimary-dark">
                            Gymmie
                        </span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <a
                            href="#features"
                            className="text-textSecondary-dark hover:text-primary transition-colors duration-300"
                        >
                            Features
                        </a>
                        <a
                            href="#how-it-works"
                            className="text-textSecondary-dark hover:text-primary transition-colors duration-300"
                        >
                            How It Works
                        </a>
                        <a
                            href="#privacy"
                            className="text-textSecondary-dark hover:text-primary transition-colors duration-300"
                        >
                            Privacy
                        </a>
                        <a
                            href="#terms"
                            className="text-textSecondary-dark hover:text-primary transition-colors duration-300"
                        >
                            Terms
                        </a>
                    </div>

                    {/* CTA Button */}
                    <div className="hidden md:block">
                        <button className="bg-primary text-background-dark px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-soft transition-all duration-300 hover:scale-105 glow">
                            Coming Soon
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button className="md:hidden text-textPrimary-dark">
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
