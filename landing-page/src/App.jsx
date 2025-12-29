import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsAndConditions from './components/TermsAndConditions';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-background-dark">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <PrivacyPolicy />
      <TermsAndConditions />
      <Footer />
    </div>
  );
}

export default App;
