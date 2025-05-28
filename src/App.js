import React, { useState, useEffect, useRef } from "react";
import { Plus, X, BarChart2, DollarSign, Percent } from "lucide-react";

// Main App component
const App = () => {
  // State for the total investment amount
  const [totalAmount, setTotalAmount] = useState("");
  // State for the main investment categories and their sub-categories
  const [categories, setCategories] = useState([
    {
      id: "mutualFunds",
      name: "Mutual Funds",
      percentage: "",
      subCategories: [],
    },
    {
      id: "stocks",
      name: "Stocks",
      percentage: "",
      subCategories: [],
    },
    {
      id: "etf",
      name: "ETF",
      percentage: "",
      subCategories: [],
    },
    {
      id: "gold",
      name: "GOLD",
      percentage: "",
      subCategories: [],
    },
    {
      id: "rd",
      name: "RD",
      percentage: "",
      subCategories: [],
    },
  ]);

  // State for displaying validation messages
  const [validationMessage, setValidationMessage] = useState("");
  // State to store the calculated results, updated only when valid
  const [displayResults, setDisplayResults] = useState(null);
  // Ref to scroll to the results section
  const resultsRef = useRef(null);

  // Effect to scroll to results when displayResults are available
  useEffect(() => {
    if (displayResults && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [displayResults]);

  // Handle changes in the total investment amount
  const handleTotalAmountChange = (e) => {
    const value = e.target.value;
    // Allow only numbers and a single decimal point
    if (/^\d*\.?\d*$/.test(value) || value === "") {
      setTotalAmount(value);
    }
  };

  // Handle changes in main category percentage
  const handleCategoryPercentageChange = (id, value) => {
    // Allow only numbers and ensure value is between 0 and 100
    if (/^\d*\.?\d*$/.test(value) || value === "") {
      const newCategories = categories.map((cat) =>
        cat.id === id ? { ...cat, percentage: value } : cat
      );
      setCategories(newCategories);
    }
  };

  // Handle changes in sub-category name
  const handleSubCategoryNameChange = (catId, subId, value) => {
    const newCategories = categories.map((cat) =>
      cat.id === catId
        ? {
            ...cat,
            subCategories: cat.subCategories.map((sub) =>
              sub.id === subId ? { ...sub, name: value } : sub
            ),
          }
        : cat
    );
    setCategories(newCategories);
  };

  // Handle changes in sub-category percentage
  const handleSubCategoryPercentageChange = (catId, subId, value) => {
    // Allow only numbers and ensure value is between 0 and 100
    if (/^\d*\.?\d*$/.test(value) || value === "") {
      const newCategories = categories.map((cat) =>
        cat.id === catId
          ? {
              ...cat,
              subCategories: cat.subCategories.map((sub) =>
                sub.id === subId ? { ...sub, percentage: value } : sub
              ),
            }
          : cat
      );
      setCategories(newCategories);
    }
  };

  // Add a new sub-category to a main category
  const addSubCategory = (catId) => {
    const newCategories = categories.map((cat) =>
      cat.id === catId
        ? {
            ...cat,
            subCategories: [
              ...cat.subCategories,
              { id: Date.now(), name: "", percentage: "" }, // Unique ID for each sub-category
            ],
          }
        : cat
    );
    setCategories(newCategories);
  };

  // Remove a sub-category from a main category
  const removeSubCategory = (catId, subId) => {
    const newCategories = categories.map((cat) =>
      cat.id === catId
        ? {
            ...cat,
            subCategories: cat.subCategories.filter((sub) => sub.id !== subId),
          }
        : cat
    );
    setCategories(newCategories);
  };

  // Function to perform validation and calculate allocation
  const performAllocationCalculation = () => {
    let currentValidationMessage = ""; // Use a local variable for validation state

    const amount = parseFloat(totalAmount);
    if (isNaN(amount) || amount <= 0) {
      currentValidationMessage =
        "Please enter a valid total investment amount.";
    }

    // Validate main category percentages
    const totalMainPercentage = categories.reduce(
      (sum, cat) => sum + (parseFloat(cat.percentage) || 0),
      0
    );

    // Check if main category percentages sum to 100% (allowing for float inaccuracies)
    if (
      !currentValidationMessage &&
      (totalMainPercentage > 100.0001 || totalMainPercentage < 99.9999)
    ) {
      currentValidationMessage = "Main category percentages must sum to 100%.";
    }

    const calculatedCategories = categories.map((cat) => {
      const mainAllocatedAmount =
        (amount * (parseFloat(cat.percentage) || 0)) / 100;

      let subCategoryAllocations = [];
      if (cat.subCategories.length > 0) {
        const totalSubPercentage = cat.subCategories.reduce(
          (sum, sub) => sum + (parseFloat(sub.percentage) || 0),
          0
        );
        // Check if sub-category percentages sum to 100% (allowing for float inaccuracies)
        if (
          !currentValidationMessage &&
          (totalSubPercentage > 100.0001 || totalSubPercentage < 99.9999)
        ) {
          currentValidationMessage = `Sub-category percentages for "${cat.name}" must sum to 100%.`;
        }

        subCategoryAllocations = cat.subCategories.map((sub) => {
          const subAllocatedAmount =
            (mainAllocatedAmount * (parseFloat(sub.percentage) || 0)) / 100;
          return {
            name: sub.name || "Unnamed Sub-category",
            percentage: parseFloat(sub.percentage) || 0,
            allocatedAmount: subAllocatedAmount,
            id: sub.id, // Ensure sub-category ID is passed for consistent keying in results
          };
        });
      }

      return {
        name: cat.name,
        percentage: parseFloat(cat.percentage) || 0,
        allocatedAmount: mainAllocatedAmount,
        subCategoryAllocations: subCategoryAllocations,
      };
    });

    // Update state based on validation
    setValidationMessage(currentValidationMessage);
    if (currentValidationMessage) {
      setDisplayResults(null); // Clear results if there's a validation error
    } else {
      setDisplayResults(calculatedCategories); // Set results if no errors
    }
  };

  // Call performAllocationCalculation whenever relevant inputs change
  // This ensures the calculations and validations run automatically as the user types
  useEffect(() => {
    performAllocationCalculation();
  }, [totalAmount, categories]); // Recalculate when totalAmount or categories state changes

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4 sm:p-8 font-inter text-gray-800">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          body {
            font-family: 'Inter', sans-serif;
          }
          .input-field {
            @apply w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 ease-in-out;
          }
          .button-primary {
            @apply bg-blue-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-200 ease-in-out flex items-center justify-center space-x-2;
          }
          .button-secondary {
            @apply bg-gray-200 text-gray-700 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-300 transition duration-200 ease-in-out flex items-center justify-center space-x-2;
          }
          .card {
            @apply bg-white p-6 rounded-xl shadow-lg border border-gray-200;
          }
          .fade-in {
            animation: fadeIn 0.5s ease-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-center text-blue-800 mb-8 sm:mb-12">
          Investment Diversification
        </h1>

        {/* Total Investment Amount Input */}
        <div className="card mb-8 fade-in">
          <label
            htmlFor="totalAmount"
            className="block text-lg font-semibold mb-3 text-gray-700"
          >
            Total Investment Amount ($)
          </label>
          <div className="relative">
            <DollarSign
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              id="totalAmount"
              type="text" // Use text to allow for decimal input
              value={totalAmount}
              onChange={handleTotalAmountChange}
              placeholder="e.g., 100000"
              className="input-field pl-10"
            />
          </div>
        </div>

        {/* Main Categories and Sub-categories */}
        <div className="space-y-6 mb-10">
          {categories.map((category) => (
            <div key={category.id} className="card fade-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {category.name}
                </h2>
                <div className="relative w-28">
                  <input
                    type="text" // Use text to allow for decimal input
                    value={category.percentage}
                    onChange={(e) =>
                      handleCategoryPercentageChange(
                        category.id,
                        e.target.value
                      )
                    }
                    placeholder="%"
                    className="input-field pr-8 text-right"
                    maxLength="5" // e.g., 100.0
                  />
                  <Percent
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                </div>
              </div>

              {/* Sub-categories */}
              <div className="space-y-4 border-t border-gray-200 pt-4 mt-4">
                {category.subCategories.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm"
                  >
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
                      placeholder="Sub-category Name"
                      className="input-field flex-grow"
                    />
                    <div className="relative w-full sm:w-28">
                      <input
                        type="text" // Use text to allow for decimal input
                        value={sub.percentage}
                        onChange={(e) =>
                          handleSubCategoryPercentageChange(
                            category.id,
                            sub.id,
                            e.target.value
                          )
                        }
                        placeholder="%"
                        className="input-field pr-8 text-right"
                        maxLength="5"
                      />
                      <Percent
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                    </div>
                    <button
                      onClick={() => removeSubCategory(category.id, sub.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition duration-200 ease-in-out"
                      aria-label="Remove sub-category"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addSubCategory(category.id)}
                  className="button-secondary w-full mt-4"
                >
                  <Plus size={18} /> Add Sub-category
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Validation Message */}
        {validationMessage && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6 animate-pulse"
            role="alert"
          >
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-2">{validationMessage}</span>
          </div>
        )}

        {/* Allocation Results */}
        {displayResults && !validationMessage && (
          <div ref={resultsRef} className="card fade-in">
            <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center space-x-2">
              <BarChart2 size={24} /> <span>Allocation Results</span>
            </h2>
            <div className="space-y-5">
              {displayResults.map((cat) => (
                <div
                  key={cat.name}
                  className="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-blue-800">
                      {cat.name}
                    </h3>
                    <span className="text-blue-700 font-bold text-xl">
                      ${cat.allocatedAmount.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-blue-600 mb-3">
                    {cat.percentage}% of total
                  </p>

                  {cat.subCategoryAllocations.length > 0 && (
                    <div className="ml-4 border-l-2 border-blue-300 pl-4 space-y-3">
                      {cat.subCategoryAllocations.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex justify-between items-center text-gray-700 text-base"
                        >
                          <span>
                            {sub.name} ({sub.percentage}%)
                          </span>
                          <span className="font-medium">
                            ${sub.allocatedAmount.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
