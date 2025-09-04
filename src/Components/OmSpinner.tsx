import React, { useEffect } from "react";

const OmSpinner = () => {
  useEffect(() => {
    const styleTagId = "om-spinner-keyframes";
    if (!document.getElementById(styleTagId)) {
      const style = document.createElement("style");
      style.id = styleTagId;
      style.innerHTML = `
        @keyframes om-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div style={styles.overlay}>
      <div style={styles.spinnerContainer}>
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          xmlns="http://www.w3.org/2000/svg"
          style={styles.svg}
          aria-label="Loading spinner"
          role="img"
        >
          {/* Glowing Background Circle */}
          <circle cx="60" cy="60" r="40" fill="gold" filter="url(#glow)" />

          {/* Spinning Halo */}
          <g style={styles.spinningCircle}>
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#ff9800"
              strokeWidth="4"
              strokeDasharray="10,10"
            />
          </g>

          {/* Om Symbol */}
          <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            fontSize="40"
            fill="#e65100"
            fontFamily="'Noto Sans Devanagari', Georgia, serif"
          >
            ॐ
          </text>

          {/* Glow Filter */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>

        <div style={styles.text}>श्री राम जय राम जय जय राम</div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(255, 248, 225, 0.85)", // translucent saffron-ish
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999, // above everything
    userSelect: "none",
    pointerEvents: "auto", // block interactions below
  },
  spinnerContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: "'Noto Sans Devanagari', Georgia, serif",
    textAlign: "center",
  },
  svg: {
    marginBottom: "1rem",
  },
  spinningCircle: {
    transformOrigin: "center",
    animation: "om-spin 4s linear infinite",
  },
  text: {
    fontSize: "1.5rem",
    color: "#d84315",
    fontWeight: "bold",
    textShadow: "1px 1px 2px #ffe082",
  },
};

export default OmSpinner;

