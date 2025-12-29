import { useEffect, useRef, useState } from 'react';

const FeatureCard = ({ icon, title, description, delay }) => {
    const [isVisible, setIsVisible] = useState(false);
    const cardRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTimeout(() => setIsVisible(true), delay);
                }
            },
            { threshold: 0.1 }
        );

        if (cardRef.current) {
            observer.observe(cardRef.current);
        }

        return () => {
            if (cardRef.current) {
                observer.unobserve(cardRef.current);
            }
        };
    }, [delay]);

    return (
        <div
            ref={cardRef}
            className={`glass p-8 rounded-2xl hover:border-primary/30 transition-all duration-500 group hover:scale-105 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
        >
            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                {icon}
            </div>
            <h3 className="text-2xl font-bold text-textPrimary-dark mb-4">{title}</h3>
            <p className="text-textSecondary-dark leading-relaxed">{description}</p>
        </div>
    );
};

const Features = () => {
    const features = [
        {
            icon: (
                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            title: 'Workout Tracking',
            description: 'Log every rep, set, and exercise with ease. Track your progress over time and see your strength gains visualized.',
        },
        {
            icon: (
                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            ),
            title: 'Meal Logging',
            description: 'Track your nutrition effortlessly. Log meals, monitor macros, and get personalized insights on your diet.',
        },
        {
            icon: (
                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            ),
            title: 'AI Form Analysis',
            description: 'Get real-time feedback on your exercise form using advanced AI. Prevent injuries and maximize effectiveness.',
        },
        {
            icon: (
                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            title: 'Smart Insights',
            description: 'Receive personalized recommendations based on your performance, recovery, and nutrition data.',
        },
        {
            icon: (
                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            title: 'Streak Tracking',
            description: 'Build discipline and stay consistent. Track your workout streaks and celebrate your commitment.',
        },
        {
            icon: (
                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            title: 'Recovery Monitoring',
            description: 'Track your rest days, sleep quality, and recovery metrics to optimize your training schedule.',
        },
    ];

    return (
        <section id="features" className="py-24 bg-background-dark">
            <div className="max-w-7xl mx-auto px-6">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-textPrimary-dark mb-4">
                        Everything You Need to
                        <span className="gradient-text"> Succeed</span>
                    </h2>
                    <p className="text-lg text-textSecondary-dark max-w-2xl mx-auto">
                        Comprehensive tools designed to help you achieve your fitness goals faster and smarter.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <FeatureCard
                            key={index}
                            icon={feature.icon}
                            title={feature.title}
                            description={feature.description}
                            delay={index * 100}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
