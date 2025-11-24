import React, { useState, useEffect } from 'react';
import { Newspaper, Menu, X, Search } from 'lucide-react';
import './Header.css';

const Header = ({ activeCategory, setActiveCategory }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const categories = ['All', 'Technology', 'Business', 'Science', 'Sports'];

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
            <div className="container header-content">
                <div className="logo">
                    <Newspaper className="logo-icon" />
                    <span className="logo-text">NewsSum</span>
                </div>

                <nav className="desktop-nav">
                    {categories.map(category => (
                        <button
                            key={category}
                            className={`nav-link ${activeCategory === category ? 'active' : ''}`}
                            onClick={() => setActiveCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </nav>

                <div className="header-actions">
                    <button className="icon-btn">
                        <Search size={20} />
                    </button>
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="mobile-menu">
                    {categories.map(category => (
                        <button
                            key={category}
                            className={`mobile-nav-link ${activeCategory === category ? 'active' : ''}`}
                            onClick={() => {
                                setActiveCategory(category);
                                setIsMobileMenuOpen(false);
                            }}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            )}
        </header>
    );
};

export default Header;
