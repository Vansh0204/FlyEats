"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "../../utils/cn";
import { formatCurrency } from "../../utils";

export type Card = {
  src: string;
  title: string;
  category: string;
  content: React.ReactNode;
  id?: string;
  price?: number;
  outletName?: string;
  outletId?: string;
  airportId?: string;
};

export const Carousel = ({
  items,
  initialScroll = 0,
}: {
  items: React.ReactNode[];
  initialScroll?: number;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = initialScroll;
    }
  }, [initialScroll]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const containerWidth = scrollRef.current.clientWidth;
    const cardWidth = containerWidth / 3;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(index, items.length - 1));
  };

  return (
    <div className="w-full">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pb-4 px-4"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className="flex-shrink-0 snap-center"
            style={{ 
              width: "calc((100% - 2rem) / 3)",
              minWidth: "320px",
              maxWidth: "400px"
            }}
          >
            {item}
          </div>
        ))}
      </div>
      {/* Navigation Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (scrollRef.current) {
                const containerWidth = scrollRef.current.clientWidth;
                const cardWidth = (containerWidth - 32) / 3; // Account for padding
                scrollRef.current.scrollTo({
                  left: index * (cardWidth + 16), // Account for gap
                  behavior: "smooth",
                });
                setActiveIndex(index);
              }
            }}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              activeIndex === index
                ? "w-8 bg-orange-500"
                : "w-2 bg-gray-300 hover:bg-gray-400"
            )}
          />
        ))}
      </div>
    </div>
  );
};

export const Card = ({
  card,
  onClick,
}: {
  card: Card;
  onClick?: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className="group relative h-[500px] md:h-[600px] w-full overflow-hidden rounded-3xl bg-white border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer"
    >
      {/* Image Section */}
      <div className="relative h-[60%] w-full overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100">
        {card.src ? (
          <img
            src={card.src}
            alt={card.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
            <div className="text-8xl opacity-50">🍽️</div>
          </div>
        )}
        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/95 backdrop-blur-sm rounded-full text-xs font-semibold text-orange-600 shadow-sm">
            {card.category}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative h-[40%] p-6 md:p-8 flex flex-col">
        <div className="flex-1">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {card.title}
          </h3>
          <div className="text-gray-600 text-sm md:text-base">
            {card.content}
          </div>
        </div>
        <div className="mt-auto pt-4 border-t border-gray-100">
          {card.price !== undefined && (
            <p className="text-orange-600 font-bold text-xl mb-2">
              {formatCurrency(card.price)}
            </p>
          )}
          {card.outletName && (
            <p className="text-sm text-gray-500">
              Available at <span className="font-semibold">{card.outletName}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
