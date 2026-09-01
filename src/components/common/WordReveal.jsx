import React, { useEffect, useRef, useState } from 'react';

export const WordReveal = ({ text, className = "", tag: Tag = "p", speed = 35 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -50px 0px" }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const words = text ? text.split(" ") : [];

  return (
    <Tag ref={elementRef} className={`inline-block ${className}`}>
      {words.map((word, index) => (
        <span
          key={index}
          className="inline-block transition-all duration-700 ease-out mr-[0.25em]"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(12px)",
            transitionDelay: `${index * speed}ms`,
          }}
        >
          {word}
        </span>
      ))}
    </Tag>
  );
};
