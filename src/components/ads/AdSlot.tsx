"use client";

import React from "react";

type Props = {
  label?: string;
  width?: number | string;
  height: number;
  className?: string;
};

export default function AdSlot({ label = "Advertisement", width = "100%", height, className = "" }: Props) {
  return (
    <div
      className={`ad-slot border border-gray-200 bg-gray-50 text-gray-500 text-xs flex items-center justify-center ${className}`}
      style={{ width, height }}
      aria-label="Advertisement"
    >
      {label}
    </div>
  );
}

