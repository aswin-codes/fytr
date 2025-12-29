import { useEffect, useRef, useState } from 'react';

const CTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ctaRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ctaRef.current) {
      observer.observe(ctaRef.current);
    }

    return () => {
      if (ctaRef.current) {
        observer.unobserve(ctaRef.current);
      }
    };
  }, []);

  return (
    <section className="py-24 bg-background-dark relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl"></div>
      </div>

      <div
        ref={ctaRef}
        className={`max-w-4xl mx-auto px-6 text-center relative z-10 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        {/* Content */}
        <h2 className="text-4xl md:text-6xl font-bold text-textPrimary-dark mb-6">
          Ready to Transform Your
          <br />
          <span className="gradient-text">Fitness Journey?</span>
        </h2>
        <p className="text-lg md:text-xl text-textSecondary-dark mb-10 max-w-2xl mx-auto">
          Join the waitlist and be among the first to experience the future of fitness tracking when Gymmie launches.
        </p>

        {/* Email Form */}
        <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto mb-8">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-6 py-4 bg-surface-dark border border-border-dark rounded-lg text-textPrimary-dark placeholder-textMuted-dark focus:outline-none focus:border-primary transition-colors"
          />
          <button className="bg-primary text-background-dark px-8 py-4 rounded-lg font-semibold hover:bg-primary-soft transition-all duration-300 hover:scale-105 glow-strong whitespace-nowrap">
            Join Waitlist
          </button>
        </div>

        <p className="text-sm text-textMuted-dark">
          No spam, ever. We'll only notify you when Gymmie is ready to launch.
        </p>

        {/* Trust indicators */}
        <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-textSecondary-dark text-sm">Secure & Private</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-textSecondary-dark text-sm">AI-Powered</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-textSecondary-dark text-sm">Mobile First</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
