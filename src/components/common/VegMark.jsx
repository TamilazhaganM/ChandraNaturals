import React from 'react';

export const VegMark = ({ isVeg = true, size = "md", className = "" }) => {
  const sizeMap = {
    sm: { outer: "w-3.5 h-3.5 p-0.5", dot: "w-1.5 h-1.5" },
    md: { outer: "w-4.5 h-4.5 p-0.5", dot: "w-2 h-2" },
    lg: { outer: "w-5.5 h-5.5 p-1", dot: "w-2.5 h-2.5" },
  };

  const current = sizeMap[size] || sizeMap.md;

  if (isVeg) {
    return (
      <div
        title="100% Vegetarian"
        aria-label="Vegetarian Food Symbol"
        className={`inline-flex items-center justify-center border-[1.5px] border-[#4CAF50] rounded-[3px] bg-forest-ink/40 flex-shrink-0 ${current.outer} ${className}`}
      >
        <span className={`rounded-full bg-[#4CAF50] ${current.dot}`} />
      </div>
    );
  }

  return (
    <div
      title="Non-Vegetarian"
      aria-label="Non-Vegetarian Food Symbol"
      className={`inline-flex items-center justify-center border-[1.5px] border-[#B5482A] rounded-[3px] bg-forest-ink/40 flex-shrink-0 ${current.outer} ${className}`}
    >
      <span
        className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[6px] border-b-[#B5482A]"
      />
    </div>
  );
};
