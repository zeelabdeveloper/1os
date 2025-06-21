import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { FaBuilding, FaUsers, FaSuitcase, FaCalendarAlt } from "react-icons/fa";

// Mock access (label, link, and icon)
const mockBackendAccess = [
  { label: "Branch", link: "setup?type=branch", icon: <FaBuilding /> },
  { label: "Department", link: "department", icon: <FaUsers /> },
  { label: "Job Stage", link: "job-stage", icon: <FaSuitcase /> },
  { label: "Leave Type", link: "leave-type", icon: <FaCalendarAlt /> },
];

function HrmsTabHeader() {
  const [accessibleItems, setAccessibleItems] = useState([]);
  const location = useLocation();

  useEffect(() => {
    setAccessibleItems(mockBackendAccess);
  }, []);

  const currentTabSlug = location.pathname.split("/").pop();

  return (
    <div className="p-4">
      {/* Header */}
      <motion.div
        className="flex justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Manage {currentTabSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            <a href="/" className="text-blue-500">Home</a> / {currentTabSlug}
          </p>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
          HRMS System Setting
        </h2>
      </motion.div>

      {/* Gradient Buttons */}
      <motion.div
        className="flex bg-amber-400/40 py-2 px-1 shadow-2xl rounded border border-b-violet-700 flex-wrap gap-2 mt-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {accessibleItems.map((item) => {
          const isActive = currentTabSlug === item.link;
          return (
            <a key={item.link} href={`/1os/${item.link}`}>
              <div
                className={`flex   items-center gap-2 px-2 py-1 rounded-full text-white text-[10px] font-medium shadow-lg transition-all duration-300 
                  ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 scale-105"
                      : "bg-gradient-to-r from-gray-400 to-gray-600 hover:from-blue-500 hover:to-purple-600 hover:scale-105"
                  }
                `}
              >
                
                {item.label}
              </div>
            </a>
          );
        })}
      </motion.div>
    </div>
  );
}

export default HrmsTabHeader;
