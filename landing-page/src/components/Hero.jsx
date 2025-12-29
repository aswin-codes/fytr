import { useEffect, useState } from 'react';

const Hero = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background-dark">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-float"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 text-center">
                <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    {/* Badge */}
                    <div className="inline-flex items-center space-x-2 bg-surface-dark/50 backdrop-blur-sm border border-border-dark px-4 py-2 rounded-full mb-8">
                        <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                        <span className="text-textSecondary-dark text-sm">Currently in Development</span>
                    </div>

                    {/* Main Heading */}
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-textPrimary-dark mb-6 leading-tight">
                        Your Smart
                        <br />
                        <span className="gradient-text">Fitness Companion</span>
                    </h1>

                    {/* Subheading */}
                    <p className="text-lg md:text-xl text-textSecondary-dark max-w-3xl mx-auto mb-12 leading-relaxed">
                        Train better, eat smarter, and stay consistent with AI-powered insights.
                        Track workouts, log meals, and analyze your form—all in one intuitive app.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button className="bg-primary text-background-dark px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-soft transition-all duration-300 hover:scale-105 glow-strong w-full sm:w-auto">
                            Join Waitlist
                        </button>
                        <button className="bg-transparent border-2 border-border-dark text-textPrimary-dark px-8 py-4 rounded-lg font-semibold text-lg hover:border-primary transition-all duration-300 hover:scale-105 w-full sm:w-auto">
                            Learn More
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-20">
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">AI</div>
                            <div className="text-sm text-textMuted-dark">Form Analysis</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">24/7</div>
                            <div className="text-sm text-textMuted-dark">Tracking</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">∞</div>
                            <div className="text-sm text-textMuted-dark">Insights</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                </svg>
            </div>
        </section>
    );
};

export default Hero;
