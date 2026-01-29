import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaGraduationCap, FaFacebookF, FaYoutube, FaInstagram, FaTwitter, FaArrowRight, FaUser, FaPhoneAlt, FaEnvelope, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import InstallPWA from './InstallPWA';

const LandingPage = () => {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const slides = [
        {
            image: "https://onlinefirstaid.com/wp-content/uploads/2019/06/school-sports-day-scaled.jpeg",
            title: "Annual Sports Day",
            subtitle: "Building Champions Through Sports Excellence"
        },
        {
            image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
            title: "State-of-the-Art Library",
            subtitle: "Fostering a Love for Reading and Learning"
        },
        {
            image: "https://c8.alamy.com/comp/KX367M/2-indian-school-students-showing-thumbs-up-with-books-in-library-KX367M.jpg",
            title: "Academic Excellence",
            subtitle: "Empowering Students for Success"
        }
    ];

    useEffect(() => {
        if (isPaused) return;

        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [isPaused, slides.length]);

    // Close menu with Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isMenuOpen) {
                setIsMenuOpen(false);
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isMenuOpen]);

    const newsItems = [
        "Admissions open for Academic Year 2026-27.",
        "VPS students win National Robotics Championship.",
        "Annual Sports Day scheduled for Feb 15th.",
        "International Baccalaureate (IB) program introduced."
    ];

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-white font-sans text-gray-800">

            {/* LEFT SIDEBAR (Glass/Blue Theme) */}
            <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="hidden lg:flex flex-col w-[25%] h-full bg-[#004e92] text-white relative z-20 shadow-2xl"
            >
                {/* Logo Area */}
                <div className="p-8 pb-4">
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-4 border border-white/20 cursor-pointer"
                    >
                        <span className="text-3xl font-serif font-bold">V</span>
                    </motion.div>
                    <h1 className="text-3xl font-bold tracking-wider leading-tight">
                        VISION <br />
                        <span className="text-yellow-400">PUBLIC SCHOOL</span>
                    </h1>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: 48 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="h-1 bg-yellow-400 mt-4 rounded-full"
                    ></motion.div>
                </div>

                {/* News Feed */}
                <div className="flex-1 px-8 py-4 overflow-y-auto">
                    <h3 className="text-xs uppercase tracking-widest text-blue-200 font-bold mb-4 border-b border-white/10 pb-2">Latest News</h3>
                    <div className="space-y-6">
                        {newsItems.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group cursor-pointer"
                            >
                                <p className="text-sm font-medium leading-relaxed group-hover:text-yellow-300 transition-colors border-l-2 border-transparent group-hover:border-yellow-300 pl-3">
                                    {item}
                                </p>
                                <span className="text-[10px] text-blue-300 mt-1 block">Just Now</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Footer / Socials */}
                <div className="p-8 pt-4 bg-[#00417a]">
                    <div className="flex gap-4 mb-6">
                        {[FaFacebookF, FaTwitter, FaYoutube, FaInstagram].map((Icon, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ scale: 1.2, y: -3 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <Icon className="hover:text-yellow-400 cursor-pointer transition-colors" />
                            </motion.div>
                        ))}
                    </div>
                    <div className="text-xs text-blue-300">
                        <p>123 Education Lane, Digital City</p>
                        <p>+91 98765 43210</p>
                    </div>
                </div>
            </motion.div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 relative h-full w-full overflow-hidden">

                {/* Top Elements Overlay */}
                <div className="absolute top-0 right-0 left-0 z-30 p-6 flex justify-between items-start pointer-events-none lg:pointer-events-auto">
                    {/* Mobile Logo (only visible on small screens) */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        className="lg:hidden pointer-events-auto bg-[#004e92] p-3 rounded-lg text-white shadow-lg"
                    >
                        <span className="font-bold">VPS</span>
                    </motion.div>

                    {/* Install PWA & Menu Buttons */}
                    <div className="ml-auto flex gap-3 items-center pointer-events-auto">
                        <InstallPWA />
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsMenuOpen(true)}
                            className="bg-white/90 backdrop-blur text-[#004e92] px-6 py-2 rounded-full font-bold shadow-lg hover:bg-yellow-400 hover:text-[#004e92] transition-colors flex items-center gap-2 text-sm uppercase tracking-wider"
                        >
                            <FaBars /> Menu
                        </motion.button>
                    </div>
                </div>

                {/* Full Screen Menu Overlay */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'tween', duration: 0.3 }}
                            className="fixed inset-0 bg-[#004e92] z-[100] text-white flex flex-col items-center justify-center p-8"
                        >
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsMenuOpen(false)}
                                className="absolute top-8 right-8 text-2xl hover:text-yellow-400 transition-colors font-bold"
                            >
                                ✕ CLOSE
                            </motion.button>
                            <nav className="space-y-6 text-center">
                                {['Home', 'About Us', 'Academics', 'Admissions', 'Campus Life', 'Contact'].map((link, idx) => (
                                    <motion.div
                                        key={link}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        whileHover={{ scale: 1.1, x: 20 }}
                                        className="text-3xl md:text-5xl font-bold hover:text-yellow-400 cursor-pointer transition-colors"
                                    >
                                        {link}
                                    </motion.div>
                                ))}
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Hero Carousel */}
                <div
                    className="absolute inset-0 z-0"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.5 }}
                            className="absolute inset-0"
                        >
                            <img src={slides[currentSlide].image} alt="Slide" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Carousel Navigation Arrows */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur hover:bg-white/40 text-white p-4 rounded-full transition-all shadow-lg hidden md:block"
                        aria-label="Previous slide"
                    >
                        <FaChevronLeft size={24} />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur hover:bg-white/40 text-white p-4 rounded-full transition-all shadow-lg hidden md:block"
                        aria-label="Next slide"
                    >
                        <FaChevronRight size={24} />
                    </button>

                    {/* Carousel Dots */}
                    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex gap-3">
                        {slides.map((_, idx) => (
                            <motion.button
                                key={idx}
                                whileHover={{ scale: 1.3 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => goToSlide(idx)}
                                className={`w-3 h-3 rounded-full transition-all ${idx === currentSlide
                                        ? 'bg-yellow-400 w-8'
                                        : 'bg-white/50 hover:bg-white/80'
                                    }`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Bottom Overlay Content */}
                <div className="absolute bottom-0 left-0 right-0 z-20 p-8 md:p-16 flex flex-col md:flex-row justify-between items-end gap-6 text-white">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="max-w-2xl"
                    >
                        <h2 className="text-4xl md:text-6xl font-black mb-2 leading-tight drop-shadow-lg">{slides[currentSlide].title}</h2>
                        <p className="text-lg md:text-xl text-yellow-400 font-medium drop-shadow-md">{slides[currentSlide].subtitle}</p>
                    </motion.div>

                    <div className="flex flex-col gap-3 w-full md:w-auto">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/login')}
                            className="bg-yellow-400 hover:bg-yellow-300 text-[#004e92] px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-black/20 transition-all flex items-center justify-center gap-3 w-full md:w-auto relative overflow-hidden group"
                        >
                            <motion.span
                                className="absolute inset-0 bg-yellow-300"
                                initial={{ x: '-100%' }}
                                whileHover={{ x: 0 }}
                                transition={{ duration: 0.3 }}
                            />
                            <span className="relative z-10 flex items-center gap-3">
                                <FaUser /> Parent / Student Login
                            </span>
                        </motion.button>
                        <div className="flex gap-2">
                            <motion.button
                                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.3)' }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-white/20 backdrop-blur border border-white/30 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition-all flex-1"
                            >
                                Virtual Tour
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.3)' }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-white/20 backdrop-blur border border-white/30 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg transition-all flex-1"
                            >
                                Enquire Now
                            </motion.button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LandingPage;
