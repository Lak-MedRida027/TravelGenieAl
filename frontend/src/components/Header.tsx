import { Plane, User, LogOut, BookOpen, X } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { jsPDF } from 'jspdf';

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [plansOpen, setPlansOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const plansRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (plansRef.current && !plansRef.current.contains(event.target as Node)) {
        setPlansOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (dropdownOpen || plansOpen || profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen, plansOpen, profileOpen]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // Get user initial
  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : null;

  // Get saved plans from localStorage
  const savedPlans = (() => {
    try {
      return JSON.parse(localStorage.getItem('savedPlans') || '[]');
    } catch {
      return [];
    }
  })();

  // Generate PDF for a plan (summary only)
  const handleDownloadPDF = (plan: any) => {
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(20);
    doc.text(plan.summary?.title || plan.destination, 20, y);
    y += 12;
    doc.setFontSize(12);
    doc.text(`Destination: ${plan.destination}`, 20, y);
    y += 8;
    doc.text(`Dates: ${plan.summary?.dates || ''}`, 20, y);
    y += 8;
    doc.text(`Travelers: ${plan.summary?.travelers || ''}`, 20, y);
    y += 8;
    doc.text(`Budget: ${plan.summary?.totalBudget || ''}`, 20, y);
    y += 8;
    doc.text(`Interests: ${(plan.summary?.interests || []).join(', ')}`, 20, y);
    doc.save(`${(plan.summary?.title || plan.destination || 'travel-plan').toLowerCase().replace(/\s+/g, '-')}-summary.pdf`);
  };

  return (
    <header className="bg-white shadow-md py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <Plane className="h-8 w-8 text-primary-600 group-hover:scale-110 transition-transform" />
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight group-hover:text-primary-600 transition-colors">
            TravelGenie<span className="text-primary-600">AI</span>
          </h1>
        </Link>
        {location.pathname === '/dashboard' && (
          <div className="flex items-center gap-4">
            {/* Saved Plans Tab */}
            <div className="relative" ref={plansRef}>
              <button
                onClick={() => setPlansOpen((open) => !open)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-semibold"
              >
                <BookOpen className="h-5 w-5" />
                Saved Plans
              </button>
              {plansOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 animate-fade-in p-2 max-h-80 overflow-y-auto">
                  <h4 className="font-bold text-gray-700 mb-2">Saved Plans</h4>
                  {savedPlans.length === 0 ? (
                    <div className="text-gray-400 text-sm">No saved plans yet.</div>
                  ) : (
                    <ul className="space-y-1">
                      {savedPlans.map((plan: any, idx: number) => (
                        <li key={idx}>
                          <button
                            className="w-full text-left px-3 py-2 rounded hover:bg-blue-50 text-gray-800"
                            onClick={() => {
                              setSelectedPlan(plan);
                              setPlansOpen(false);
                            }}
                          >
                            {plan.summary?.title || plan.destination}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
            {/* Profile Avatar */}
            <div className="flex items-center gap-4" ref={dropdownRef}>
              <button
                className="rounded-full border-2 border-primary-100 hover:border-primary-600 transition-all focus:outline-none relative w-10 h-10 flex items-center justify-center bg-primary-50"
                onClick={() => setProfileOpen((open) => !open)}
              >
                {userInitial ? (
                  <span className="text-lg font-bold text-primary-700">{userInitial}</span>
                ) : (
                  <User className="h-6 w-6 text-primary-400" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Saved Plan Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-fade-in">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
              onClick={() => setSelectedPlan(null)}
            >
              <X className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-bold mb-2">{selectedPlan.summary?.title || selectedPlan.destination}</h2>
            <div className="mb-2 text-gray-700">
              <span className="font-semibold">Destination:</span> {selectedPlan.destination}
            </div>
            <div className="mb-2 text-gray-700">
              <span className="font-semibold">Dates:</span> {selectedPlan.summary?.dates}
            </div>
            <div className="mb-2 text-gray-700">
              <span className="font-semibold">Travelers:</span> {selectedPlan.summary?.travelers}
            </div>
            <div className="mb-2 text-gray-700">
              <span className="font-semibold">Budget:</span> {selectedPlan.summary?.totalBudget}
            </div>
            <div className="mb-2 text-gray-700">
              <span className="font-semibold">Interests:</span> {selectedPlan.summary?.interests?.join(', ')}
            </div>
            <button
              className="mt-4 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold w-full"
              onClick={() => handleDownloadPDF(selectedPlan)}
            >
              Download PDF
            </button>
          </div>
        </div>
      )}
      {/* Profile Modal */}
      {profileOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div ref={profileRef} className="bg-white rounded-xl shadow-2xl max-w-xs w-full p-6 relative animate-fade-in">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
              onClick={() => setProfileOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
            <div className="flex flex-col items-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-3xl font-bold text-primary-700 mb-2">
                {userInitial || <User className="h-8 w-8 text-primary-400" />}
              </div>
              <div className="text-lg font-semibold text-gray-800">{user?.email || 'Guest'}</div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold shadow-sm mt-2"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;