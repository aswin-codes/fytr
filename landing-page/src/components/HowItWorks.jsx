import { useEffect, useRef, useState } from 'react';

const Step = ({ number, title, description, isLeft, delay }) => {
    const [isVisible, setIsVisible] = useState(false);
    const stepRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTimeout(() => setIsVisible(true), delay);
                }
            },
            { threshold: 0.1 }
        );

        if (stepRef.current) {
            observer.observe(stepRef.current);
        }

        return () => {
            if (stepRef.current) {
                observer.unobserve(stepRef.current);
            }
        };
    }, [delay]);

    return (
        <div
            ref={stepRef}
            className={`flex items-center gap-8 ${isLeft ? 'flex-row' : 'flex-row-reverse'} transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : `opacity-0 ${isLeft ? '-translate-x-10' : 'translate-x-10'}`
                }`}
        >
            {/* Content */}
            <div className={`flex-1 ${isLeft ? 'text-right' : 'text-left'}`}>
                <h3 className="text-2xl md:text-3xl font-bold text-textPrimary-dark mb-3">{title}</h3>
                <p className="text-textSecondary-dark leading-relaxed">{description}</p>
            </div>

            {/* Number Circle */}
            <div className="relative flex-shrink-0">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-background-dark text-2xl font-bold glow-strong">
                    {number}
                </div>
                <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-20"></div>
            </div>

            {/* Spacer for alignment */}
            <div className="flex-1"></div>
        </div>
    );
};

const HowItWorks = () => {
    const steps = [
        {
            number: 1,
            title: 'Create Your Profile',
            description: 'Set up your account with your fitness goals, experience level, and preferences. Gymmie will personalize everything for you.',
            isLeft: true,
        },
        {
            number: 2,
            title: 'Choose Your Path',
            description: 'Follow AI-generated workout plans or create your own custom routines. Gymmie adapts to your style.',
            isLeft: false,
        },
        {
            number: 3,
            title: 'Track Everything',
            description: 'Log your workouts, meals, and progress. Use AI form analysis to perfect your technique in real-time.',
            isLeft: true,
        },
        {
            number: 4,
            title: 'Get Insights',
            description: 'Receive personalized recommendations on training, nutrition, and recovery based on your data and goals.',
            isLeft: false,
        },
        {
            number: 5,
            title: 'Stay Consistent',
            description: 'Build streaks, celebrate milestones, and watch your transformation unfold with detailed analytics.',
            isLeft: true,
        },
    ];

    return (
        <section id="how-it-works" className="py-24 bg-surface-dark relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent"></div>

            <div className="max-w-5xl mx-auto px-6 relative z-10">
                {/* Section Header */}
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold text-textPrimary-dark mb-4">
                        How <span className="gradient-text">Gymmie</span> Works
                    </h2>
                    <p className="text-lg text-textSecondary-dark max-w-2xl mx-auto">
                        Your journey to better fitness starts here. Follow these simple steps to transform your training.
                    </p>
                </div>

                {/* Steps */}
                <div className="space-y-16">
                    {steps.map((step, index) => (
                        <Step
                            key={index}
                            number={step.number}
                            title={step.title}
                            description={step.description}
                            isLeft={step.isLeft}
                            delay={index * 150}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
