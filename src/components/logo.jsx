import React from 'react';

const DeFiMarTLogo = ({className, alt}) => {
  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0px',
    fontFamily: "'Montserrat', sans-serif",
  };

  const svgStyle = {
    width: '40px',
    height: '40px',
    flexShrink: 0,
  };

  const logoTextStyle = {
    fontWeight: 700,
    fontSize: '30px',
    marginLeft:'-10px',
    background: 'linear-gradient(45deg, #00FFA3, #DC1FFF, #00D2FF)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  return (
    <div style={containerStyle} className={className} aria-label={alt || "DeFiMarT Logo"}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={svgStyle}
        aria-hidden="true"
        focusable="false"
        role="img"
      >
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00FFA3" />
            <stop offset="50%" stopColor="#DC1FFF" />
            <stop offset="100%" stopColor="#00D2FF" />
          </linearGradient>
        </defs>
        {/* Background rectangle with rounded corners */}
        <rect x="10" y="10" width="50" height="80" rx="20" fill="url(#grad)" />
        {/* Inner cutout circle to create 'D' shape hollow */}
        <circle cx="60" cy="50" r="35" fill="#121212" />
      </svg>
      <div style={logoTextStyle} >DeFiMarT</div>
    </div>
  );
};

export default DeFiMarTLogo;