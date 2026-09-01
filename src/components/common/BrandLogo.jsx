import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../../assets/logo.png';

export const BrandLogo = ({ size = "md", showText = true, className = "", asLink = false }) => {
  const sizeMap = {
    sm: { img: "h-8 w-auto", title: "text-lg", sub: "text-[9px]" },
    md: { img: "h-11 sm:h-12 w-auto", title: "text-xl sm:text-2xl", sub: "text-[9px] sm:text-[10px]" },
    lg: { img: "h-16 sm:h-20 w-auto", title: "text-2xl sm:text-3xl", sub: "text-xs" },
    xl: { img: "h-24 sm:h-28 w-auto", title: "text-3xl sm:text-4xl", sub: "text-sm" },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const content = (
    <div className={`flex items-center gap-3 select-none flex-shrink-0 group ${className}`}>
      {/* Brand Logo Image from assets/logo.png */}
      <div className="relative flex-shrink-0 flex items-center justify-center">
        <img
          src={logoImg}
          alt="Chandra Naturals"
          className={`${currentSize.img} object-contain drop-shadow-[0_2px_12px_rgba(201,162,78,0.35)] transition-transform duration-300 group-hover:scale-105`}
        />
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col text-left">
          <span className={`font-fraunces font-bold tracking-wide leading-none ${currentSize.title} text-gold-gradient`}>
            Chandra
          </span>
          <span className={`font-sans tracking-[0.28em] font-semibold text-gold-antique uppercase mt-1 leading-none ${currentSize.sub}`}>
            Naturals
          </span>
        </div>
      )}
    </div>
  );

  if (asLink) {
    return (
      <Link to="/" className="inline-flex items-center" aria-label="Chandra Naturals Homepage">
        {content}
      </Link>
    );
  }

  return content;
};
