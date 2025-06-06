import React, { useState, useEffect, useCallback } from "react";
import { Plus, X, Save, FolderOpen, Trash2, RefreshCw } from "lucide-react";
import { PieChart, Pie, Cell, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, LabelList, ResponsiveContainer } from 'recharts';

// Custom color palette
const COLORS = {
  primary: '#1E88E5',       // Vibrant Blue
  secondary: '#00C853',     // Fresh Green
  accent: '#FF4081',        // Pink Accent
  neutral: '#424242',       // Dark Grey
  surface: '#ffffff',
  background: '#F5F7FA',
  chartColors: [
    ['#2196F3', '#1565C0'],  // Blue gradient
    ['#00E676', '#00C853'],  // Green gradient
    ['#FF4081', '#C2185B'],  // Pink gradient
    ['#FFC107', '#FFA000'],  // Amber gradient
    ['#7C4DFF', '#651FFF'],  // Deep Purple gradient
    ['#00BCD4', '#0097A7'],  // Cyan gradient
  ]
};

// Dummy data structure
const DUMMY_DATA = {
  categories: [
    { 
      name: "Mutual Funds", 
      value: 60, 
      amount: 600000, 
      color: COLORS.chartColors[0],
      subCategories: [
        { name: "Large Cap", value: 40, amount: 240000 },
        { name: "Mid Cap", value: 35, amount: 210000 },
        { name: "Small Cap", value: 25, amount: 150000 }
      ]
    },
    { 
      name: "Stocks", 
      value: 40, 
      amount: 400000, 
      color: COLORS.chartColors[1],
      subCategories: [
        { name: "IT Sector", value: 45, amount: 180000 },
        { name: "Banking", value: 35, amount: 140000 },
        { name: "FMCG", value: 20, amount: 80000 }
      ]
    }
  ],
  totalAmount: 1000000
};

// Indian currency formatter function
const formatIndianCurrency = (amount) => {
  if (!amount) return '';
  
  // Remove any existing commas and non-numeric characters
  const number = amount.toString().replace(/[^0-9.]/g, '');
  
  // Split the number into whole and decimal parts
  const parts = number.split('.');
  let wholePart = parts[0];
  const decimalPart = parts[1] || '';

  // Format according to Indian number system
  // First, get the last 3 digits
  const lastThree = wholePart.slice(-3);
  // Get the remaining digits
  const otherNumbers = wholePart.slice(0, -3);
  // Insert commas every 2 digits in the remaining part
  const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  
  // Combine the parts
  wholePart = otherNumbers ? formatted + ',' + lastThree : lastThree;
  
  // Return the formatted number with decimal part if exists
  return decimalPart ? `${wholePart}.${decimalPart}` : wholePart;
};

// Add this function at the top level to handle responsive dimensions
const getResponsiveDimensions = () => {
  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
  
  return {
    pieChart: {
      innerRadius: isMobile ? 40 : isTablet ? 60 : 80,
      outerRadius: isMobile ? 55 : isTablet ? 75 : 90,
      labelRadius: isMobile ? 1.6 : isTablet ? 1.5 : 1.6,
      centerTextSize: isMobile ? 'text-sm' : 'text-2xl',
      labelBoxWidth: isMobile ? 160 : isTablet ? 180 : 200,
      fontSize: isMobile ? 11 : isTablet ? 12 : 13,
      labelSpacing: 22
    },
    barChart: {
      margin: {
        top: 20,
        right: isMobile ? 180 : isTablet ? 200 : 240,
        left: isMobile ? 140 : isTablet ? 160 : 180,
        bottom: 20
      },
      barSize: isMobile ? 20 : isTablet ? 25 : 30,
      fontSize: isMobile ? 10 : isTablet ? 11 : 12,
      labelWidth: isMobile ? 130 : isTablet ? 150 : 170
    }
  };
};

const App = () => {
  const [totalAmount, setTotalAmount] = useState("");
  const [categories, setCategories] = useState([
    {
      id: "mutualFunds",
      name: "Mutual Funds",
      percentage: "",
      subCategories: [],
      isFixed: true
    },
    {
      id: "stocks",
      name: "Stocks",
      percentage: "",
      subCategories: [],
      isFixed: true
    }
  ]);

  const [profiles, setProfiles] = useState([]);
  const [currentProfile, setCurrentProfile] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [displayResults, setDisplayResults] = useState(null);

  // Add a state for responsive dimensions
  const [dimensions, setDimensions] = useState(getResponsiveDimensions());

  // Define loadProfile using useCallback
  const loadProfile = useCallback((profileName) => {
    const profile = profiles.find(p => p.name === profileName);
    if (profile) {
      setTotalAmount(profile.totalAmount);
      setCategories(profile.categories);
      setCurrentProfile(profileName);
      localStorage.setItem('lastUsedProfile', profileName);
    }
  }, [profiles]);

  // Delete a profile
  const deleteProfile = (profileName) => {
    const updatedProfiles = profiles.filter(p => p.name !== profileName);
    setProfiles(updatedProfiles);
    if (currentProfile === profileName) {
      setCurrentProfile("");
    }
    localStorage.setItem('investmentProfiles', JSON.stringify(updatedProfiles));
    if (localStorage.getItem('lastUsedProfile') === profileName) {
      localStorage.removeItem('lastUsedProfile');
    }
  };

  // Load profiles effect with cleanup
  useEffect(() => {
    let mounted = true;

    const loadSavedProfiles = () => {
      const savedProfiles = localStorage.getItem('investmentProfiles');
      if (savedProfiles && mounted) {
        const parsedProfiles = JSON.parse(savedProfiles);
        setProfiles(parsedProfiles);
        
        const lastUsedProfile = localStorage.getItem('lastUsedProfile');
        if (lastUsedProfile && mounted) {
          loadProfile(lastUsedProfile);
        }
      }
    };

    loadSavedProfiles();
    return () => {
      mounted = false;
    };
  }, [loadProfile]);

  // Save profile function
  const saveProfile = (profileName) => {
    const profile = {
      name: profileName,
      totalAmount,
      categories,
    };

    const updatedProfiles = [...profiles.filter(p => p.name !== profileName), profile];
    setProfiles(updatedProfiles);
    setCurrentProfile(profileName);
    localStorage.setItem('investmentProfiles', JSON.stringify(updatedProfiles));
    localStorage.setItem('lastUsedProfile', profileName);
    setShowSaveDialog(false);
    setNewProfileName("");
  };

  // Format data for charts
  const getPieChartData = (categories) => {
    const hasData = categories.some(cat => parseFloat(cat.percentage) > 0);
    const hasTotalAmount = parseFloat(totalAmount) > 0;
    
    if (!hasData || !hasTotalAmount) {
      return DUMMY_DATA.categories.map(cat => ({
        ...cat,
        isDummy: true // Add this flag to identify dummy data
      }));
    }
    return categories.map((cat, index) => ({
      name: cat.name,
      value: parseFloat(cat.percentage) || 0,
      amount: parseFloat(totalAmount) * (parseFloat(cat.percentage) || 0) / 100,
      color: COLORS.chartColors[index % COLORS.chartColors.length],
      isDummy: false
    }));
  };

  // Get sub-category chart data
  const getSubCategoryChartData = (category) => {
    if (!category || !category.subCategories || !category.subCategories.length) {
      const dummyCategory = DUMMY_DATA.categories.find(c => c.name === category.name);
      if (dummyCategory) {
        return dummyCategory.subCategories.map(sub => ({
          ...sub,
          isDummy: true
        }));
      }
      return [];
    }
    
    const categoryAmount = parseFloat(totalAmount) * (parseFloat(category.percentage) || 0) / 100;
    return category.subCategories
      .map(sub => {
        const value = parseFloat(sub.percentage) || 0;
        const amount = categoryAmount * (value / 100);
        return {
          name: sub.name || 'Unnamed',
          value: value,
          amount: amount,
          isDummy: false
        };
      })
      .filter(item => item.value > 0);
  };

  // Handle changes in total amount
  const handleTotalAmountChange = (e) => {
    const value = e.target.value;
    // Remove any non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    setTotalAmount(numericValue);
  };

  // Handle changes in category percentage
  const handleCategoryPercentageChange = (id, value) => {
    setCategories(prev => prev.map((cat) =>
      cat.id === id ? { ...cat, percentage: value } : cat
    ));
  };

  // Handle changes in sub-category name
  const handleSubCategoryNameChange = (catId, subId, value) => {
    setCategories(prev => prev.map((cat) =>
      cat.id === catId
        ? {
            ...cat,
            subCategories: cat.subCategories.map((sub) =>
              sub.id === subId ? { ...sub, name: value } : sub
            ),
          }
        : cat
    ));
  };

  // Handle changes in sub-category percentage
  const handleSubCategoryPercentageChange = (catId, subId, value) => {
    setCategories(prev => prev.map((cat) =>
      cat.id === catId
        ? {
            ...cat,
            subCategories: cat.subCategories.map((sub) =>
              sub.id === subId ? { ...sub, percentage: value } : sub
            ),
          }
        : cat
    ));
  };

  // Add a new sub-category
  const addSubCategory = (catId) => {
    setCategories(prev => prev.map((cat) =>
      cat.id === catId
        ? {
            ...cat,
            subCategories: [
              ...cat.subCategories,
              { id: Date.now().toString(), name: "", percentage: "0" },
            ],
          }
        : cat
    ));
  };

  // Remove a sub-category
  const removeSubCategory = (catId, subId) => {
    setCategories(prev => prev.map((cat) =>
      cat.id === catId
        ? {
            ...cat,
            subCategories: cat.subCategories.filter((sub) => sub.id !== subId),
          }
        : cat
    ));
  };

  // Update calculation effect with cleanup
  useEffect(() => {
    let mounted = true;

    const calculateAllocation = () => {
      if (!mounted) return;

      let currentValidationMessage = "";
      const amount = parseFloat(totalAmount);
      
      if (isNaN(amount) || amount <= 0) {
        currentValidationMessage = "Please enter a valid total investment amount.";
        setValidationMessage(currentValidationMessage);
        setDisplayResults(null);
        return;
      }

      const totalMainPercentage = categories.reduce(
        (sum, cat) => sum + (parseFloat(cat.percentage) || 0),
        0
      );

      if (totalMainPercentage > 100.0001 || totalMainPercentage < 99.9999) {
        currentValidationMessage = "Main category percentages must sum to 100%.";
      }

      categories.forEach((cat) => {
        const mainCategoryPercentage = parseFloat(cat.percentage) || 0;
        if (mainCategoryPercentage > 0 && cat.subCategories.length > 0) {
          const totalSubPercentage = cat.subCategories.reduce(
            (sum, sub) => sum + (parseFloat(sub.percentage) || 0),
            0
          );
          if (totalSubPercentage > 100.0001 || totalSubPercentage < 99.9999) {
            currentValidationMessage = `Sub-categories under ${cat.name} must sum to 100%.`;
          }
        }
      });

      if (mounted) {
        setValidationMessage(currentValidationMessage);
        setDisplayResults(currentValidationMessage ? null : categories);
      }
    };

    calculateAllocation();
    return () => {
      mounted = false;
    };
  }, [totalAmount, categories]);

  // Clear all data function
  const clearAllData = () => {
    // Clear local storage
    localStorage.removeItem('investmentProfiles');
    localStorage.removeItem('lastUsedProfile');

    // Reset all state
    setProfiles([]);
    setCurrentProfile("");
    setTotalAmount("");
    setCategories([
      {
        id: "mutualFunds",
        name: "Mutual Funds",
        percentage: "",
        subCategories: [],
        isFixed: true
      },
      {
        id: "stocks",
        name: "Stocks",
        percentage: "",
        subCategories: [],
        isFixed: true
      }
    ]);
    setShowSaveDialog(false);
    setNewProfileName("");
    setValidationMessage("");
    setDisplayResults(null);

    // Force page reload to ensure clean state
    window.location.reload();
  };

  // Add resize handler
  useEffect(() => {
    const handleResize = () => {
      setDimensions(getResponsiveDimensions());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] text-white relative overflow-hidden">
      <div className="layout-container flex flex-col lg:flex-row gap-4 p-4">
        {/* Left Panel - Made responsive */}
        <div className="panel w-full lg:w-[40%] bg-[#1E1E1E] rounded-lg p-4">
          <div className="panel-header mb-6">
            <h1 className="title text-xl sm:text-2xl font-bold text-purple-400">AssetAllocate Pro</h1>
          </div>
          
          <div className="panel-content space-y-4">
            {/* Profile Management Section */}
            <div className="card bg-[#2D2D2D] rounded-lg p-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                <h3 className="text-lg font-medium text-white">Saved Allocations</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="button-primary bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md flex items-center gap-2 transition-colors text-sm sm:text-base"
                    onClick={() => setShowSaveDialog(true)}
                  >
                    <Save className="w-4 h-4" />
                    Save Current
                  </button>
                  <button
                    className="button-danger bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md flex items-center gap-2 transition-colors text-sm sm:text-base"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear all saved data? This action cannot be undone.')) {
                        clearAllData();
                      }
                    }}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Clear All Data
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {profiles.map((profile) => (
                  <button
                    key={profile.name}
                    onClick={() => loadProfile(profile.name)}
                    className={`profile-chip flex items-center gap-2 px-3 py-2 rounded-md text-sm sm:text-base ${
                      currentProfile === profile.name 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-[#363636] text-gray-300 hover:bg-[#404040]'
                    }`}
                  >
                    <FolderOpen className="w-4 h-4" />
                    {profile.name}
                    <Trash2
                      className="w-4 h-4 text-red-400 hover:text-red-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProfile(profile.name);
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Total Investment Amount Input */}
            <div className="card bg-[#2D2D2D] rounded-lg p-4">
              <h3 className="text-lg font-medium mb-3 text-white">Total Investment Amount</h3>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-purple-400 font-medium">₹</span>
                <input
                  type="text"
                  value={formatIndianCurrency(totalAmount)}
                  onChange={handleTotalAmountChange}
                  placeholder="Enter amount"
                  className="input-field w-full bg-[#363636] text-white border border-gray-600 rounded-md px-8 py-2 focus:outline-none focus:border-purple-500"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">Enter amount in Indian Rupees (₹)</p>
              
              {/* Validation Message */}
              {validationMessage && (
                <div className="validation-message bg-red-900/50 text-red-200 p-4 rounded-lg mt-4">
                  <div className="flex items-center gap-2">
                    <span role="img" aria-label="warning">⚠️</span>
                    {validationMessage}
                  </div>
                </div>
              )}
            </div>

            {/* Categories Section - Made responsive */}
            {categories.map((category, index) => (
              <div key={category.id} className="card bg-[#2D2D2D] rounded-lg p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: COLORS.chartColors[index % COLORS.chartColors.length]
                      }}
                    />
                    <h3 className="text-lg font-medium text-white">{category.name}</h3>
                  </div>
                  <div className="flex items-center w-full sm:w-auto">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={category.percentage || "0"}
                      onChange={(e) =>
                        handleCategoryPercentageChange(category.id, e.target.value)
                      }
                      className="input-field percentage-input w-full sm:w-20 bg-[#363636] text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:border-purple-500"
                    />
                    <span className="ml-2 text-gray-300">%</span>
                  </div>
                </div>

                {/* Sub-categories - Made responsive */}
                {category.subCategories.map((sub) => (
                  <div
                    key={sub.id}
                    className="ml-3 sm:ml-6 mb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 w-full sm:w-auto sm:flex-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: COLORS.chartColors[index % COLORS.chartColors.length],
                          opacity: 0.6
                        }}
                      />
                      <input
                        type="text"
                        value={sub.name}
                        onChange={(e) =>
                          handleSubCategoryNameChange(
                            category.id,
                            sub.id,
                            e.target.value
                          )
                        }
                        placeholder="Enter name"
                        className="input-field w-full bg-[#363636] text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={sub.percentage || "0"}
                        onChange={(e) =>
                          handleSubCategoryPercentageChange(
                            category.id,
                            sub.id,
                            e.target.value
                          )
                        }
                        className="input-field percentage-input w-full sm:w-20 bg-[#363636] text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:border-purple-500"
                      />
                      <span className="text-gray-300">%</span>
                      <button
                        onClick={() => removeSubCategory(category.id, sub.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add Sub-category Button */}
                <div className="ml-3 sm:ml-6">
                  <button
                    onClick={() => addSubCategory(category.id)}
                    className="button-primary bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md flex items-center gap-2 transition-colors group text-sm sm:text-base"
                  >
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                    <span>Add {category.name}</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Developer Info and Promotion Section - Amex Gold Card Style */}
            <div className="mt-4 sm:mt-8 card rounded-lg p-4 sm:p-8 relative overflow-hidden min-h-[180px] sm:min-h-[250px] md:min-h-[280px] lg:min-h-[300px]" 
                 style={{
                   background: 'linear-gradient(135deg, #DFB658 0%, #C19A49 50%, #DFB658 100%)',
                   boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                 }}>
              {/* Metallic pattern overlay */}
              <div className="absolute inset-0" 
                   style={{ 
                     backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.1) 55%, rgba(255,255,255,0) 100%)',
                     backgroundSize: '200% 100%',
                     animation: 'shimmer 3s infinite linear'
                   }}>
              </div>

              <div className="relative">
                <div className="mb-4 sm:mb-8">
                  {/* Text Content */}
                  <div className="pr-20 sm:pr-32">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl tracking-wider sm:tracking-widest text-white mb-2 font-light uppercase"
                        style={{ fontFamily: 'Arial, sans-serif', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                      Designed & Developed by
                    </h3>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-wider mb-2"
                       style={{ fontFamily: 'Arial, sans-serif', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                      OMKAR NAIK
                    </p>
                    <p className="text-xs sm:text-sm lg:text-base text-white/90 tracking-wider uppercase"
                       style={{ fontFamily: 'Arial, sans-serif', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                      Full Stack Developer
                    </p>
                  </div>

                  {/* American Express Logo */}
                  <div className="absolute top-0 sm:top-2 right-2 sm:right-8 md:right-12 lg:right-16 xl:right-20">
                    <div className="bg-white rounded-full p-1.5 sm:p-2" style={{ 
                      width: 'auto',
                      height: 'auto',
                      transform: 'scale(0.8) sm:scale(1) md:scale(1.1) lg:scale(1.2)',
                    }}>
                      <img 
                        src="https://www.cdnlogo.com/logos/a/93/american-express-7200.svg" 
                        alt="American Express"
                        className="w-12 sm:w-20 md:w-24 lg:w-28 h-auto"
                        style={{
                          opacity: 1,
                          mixBlendMode: 'normal'
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 sm:mt-12 md:mt-16 lg:mt-20 pt-4 sm:pt-6 md:pt-8 lg:pt-10 border-t border-white/20">
                  <p className="text-center text-[10px] sm:text-xs lg:text-sm text-white/80 tracking-wider" 
                     style={{ fontFamily: 'Arial, sans-serif', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                    © 2025 ALL RIGHTS RESERVED
                  </p>
                </div>
              </div>

              {/* Hologram effect */}
              <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 lg:bottom-10 left-3 sm:left-4 w-8 sm:w-12 lg:w-14 h-8 sm:h-12 lg:h-14 rounded-full opacity-50"
                   style={{
                     background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.1) 60%, rgba(255,255,255,0) 100%)'
                   }}>
              </div>
            </div>

            <style jsx>{`
              @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
              }
            `}</style>
          </div>
        </div>

        {/* Right Panel - Made responsive */}
        <div className="panel w-full lg:w-[60%] bg-[#1E1E1E] rounded-lg p-4">
          <div className="panel-header mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-purple-400">Portfolio Visualization</h2>
            {(!totalAmount || !displayResults?.some(cat => parseFloat(cat.percentage) > 0)) && (
              <p className="text-gray-400 text-sm mt-2">
                This is a sample visualization. Enter your investment details to see your actual portfolio distribution.
              </p>
            )}
          </div>
          
          <div className="panel-content space-y-6">
            {/* Portfolio Distribution Chart */}
            <div className="card bg-[#2D2D2D] rounded-lg p-4 sm:p-6 md:p-8">
              <h3 className="text-sm sm:text-lg font-medium mb-4 sm:mb-6 text-white">
                Portfolio Distribution
                {(!totalAmount || !displayResults?.some(cat => parseFloat(cat.percentage) > 0)) && (
                  <span className="text-xs sm:text-sm font-normal text-gray-400 ml-2">(Sample Data)</span>
                )}
              </h3>
              <div className="chart-container w-full h-[400px] sm:h-[450px] md:h-[500px] lg:h-[550px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={displayResults?.some(cat => parseFloat(cat.percentage) > 0) 
                      ? getPieChartData(displayResults)
                      : DUMMY_DATA.categories}
                  >
                    <defs>
                      {COLORS.chartColors.map((gradient, index) => (
                        <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor={gradient[0]} />
                          <stop offset="100%" stopColor={gradient[1]} />
                        </linearGradient>
                      ))}
                    </defs>
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#fff', fontSize: 14 }}
                      axisLine={{ stroke: '#444' }}
                      tickLine={{ stroke: '#444' }}
                    />
                    <YAxis 
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                      tick={{ fill: '#fff', fontSize: 12 }}
                      axisLine={{ stroke: '#444' }}
                      tickLine={{ stroke: '#444' }}
                    />
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <Bar
                      dataKey="value"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={100}
                    >
                      {(displayResults?.some(cat => parseFloat(cat.percentage) > 0) 
                        ? getPieChartData(displayResults)
                        : DUMMY_DATA.categories
                      ).map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`}
                          fill={`url(#gradient-${index})`}
                        />
                      ))}
                      <LabelList
                        dataKey={(entry) => `${entry.value}% | ₹${formatIndianCurrency(entry.amount)}`}
                        position="top"
                        fill="#fff"
                        fontSize={12}
                        offset={10}
                      />
                    </Bar>
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sub-categories Visualization */}
            {(displayResults?.some(cat => parseFloat(cat.percentage) > 0)
              ? displayResults
              : DUMMY_DATA.categories
            ).map((category, index) => (
              category.subCategories?.length > 0 && (
                <div key={category.name} 
                     className={`card rounded-lg p-2 sm:p-4 transition-all duration-300 ${
                       category.name === "Mutual Funds" 
                         ? "bg-gradient-to-br from-[#1a237e] to-[#283593]" 
                         : "bg-gradient-to-br from-[#4A154B] to-[#2E1437]"
                     }`}>
                  <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-4 text-white flex items-center gap-2">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full" 
                         style={{ 
                           background: category.name === "Mutual Funds" 
                             ? "linear-gradient(135deg, #3949ab, #1a237e)" 
                             : "linear-gradient(135deg, #9C27B0, #4A154B)" 
                         }} 
                    />
                    {category.name} Breakdown
                  </h3>
                  <div className="chart-container overflow-x-hidden overflow-y-auto max-h-[200px] sm:max-h-[400px] bg-black/20 rounded-lg p-2">
                    <div style={{ height: Math.max(180, category.subCategories.length * 35) }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                          layout="vertical"
                          data={getSubCategoryChartData(category)}
                          margin={{
                            top: 10,
                            right: 120,
                            left: 100,
                            bottom: 10
                          }}
                        >
                          <XAxis
                            type="number"
                            domain={[0, 100]}
                            tickFormatter={(value) => `${value}%`}
                            tick={{ 
                              fill: '#fff',
                              fontSize: 10
                            }}
                            tickCount={5}
                          />
                          <YAxis
                            type="category"
                            dataKey="name"
                            width={90}
                            tick={{
                              fill: '#fff',
                              fontSize: 10,
                              width: 80,
                              wordWrap: 'break-word'
                            }}
                            interval={0}
                          />
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.1)" />
                          <Bar
                            dataKey="value"
                            fill={category.name === "Mutual Funds" ? "#5c6bc0" : "#9C27B0"}
                            radius={[0, 4, 4, 0]}
                            barSize={20}
                          >
                            <LabelList
                              dataKey={(entry) => {
                                const percent = entry.value.toFixed(1);
                                const amount = formatIndianCurrency(entry.amount);
                                return `${percent}% | ₹${amount}`;
                              }}
                              position="right"
                              fill="#fff"
                              fontSize={10}
                              offset={5}
                            />
                          </Bar>
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Summary Grid - Mobile Optimized */}
                  <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {getSubCategoryChartData(category).map((subCat, idx) => (
                      <div key={idx} 
                           className="bg-black/20 p-2 sm:p-3 rounded-md hover:bg-black/30 transition-all duration-300"
                           style={{
                             borderLeft: `3px solid ${category.name === "Mutual Funds" ? "#5c6bc0" : "#9C27B0"}`
                           }}>
                        <div className="flex items-center gap-1.5">
                          <div 
                            className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
                            style={{ 
                              backgroundColor: category.name === "Mutual Funds" ? "#5c6bc0" : "#9C27B0"
                            }}
                          />
                          <span className="text-xs sm:text-sm text-white font-medium">{subCat.name}</span>
                        </div>
                        <div className="mt-1.5 sm:mt-2 pl-3 sm:pl-4">
                          <p className="text-sm sm:text-lg font-medium text-white">₹{formatIndianCurrency(subCat.amount)}</p>
                          <p className="text-[10px] sm:text-xs text-gray-300">{subCat.value.toFixed(1)}% of {category.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </div>

      {/* Save Profile Dialog - Made responsive */}
      {showSaveDialog && (
        <>
          <div className="dialog-overlay fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setShowSaveDialog(false)} />
          <div className="save-dialog fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#2D2D2D] rounded-lg p-4 sm:p-6 w-[90%] sm:w-96 z-50">
            <h3 className="text-lg font-medium mb-4 text-white">Save Allocation Profile</h3>
            <input
              type="text"
              className="input-field w-full mb-4 bg-[#363636] text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:border-purple-500"
              placeholder="Enter profile name"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors text-sm sm:text-base"
                onClick={() => setShowSaveDialog(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                onClick={() => saveProfile(newProfileName)}
                disabled={!newProfileName.trim()}
              >
                Save
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
