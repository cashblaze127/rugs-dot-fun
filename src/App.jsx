import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import "./App.css";
import createBlockies from "ethereum-blockies-base64";
import solanaLogo from "./assets/solanaLogoMark.svg"; // Import Solana logo
import rugsLogo from "./assets/rugslogo.svg"; // Import Rugs logo
import { TransitionGroup, CSSTransition } from 'react-transition-group';

// Mock data for chart and players
const initialMockChartData = [];  // Changed to empty array to prevent candles showing on load

// Mock token data for trade markers
const mockTokens = [
  { symbol: "SOL", logo: solanaLogo },
  { symbol: "FREE", logo: rugsLogo },
];

// Mock trade markers data - we'll add to this dynamically during simulation
const initialMockTrades = [];

// Mock ETH addresses for generating blockies
const mockAddresses = [
  "0x1234567890123456789012345678901234567890",
  "0x2345678901234567890123456789012345678901",
  "0x3456789012345678901234567890123456789012",
  "0x4567890123456789012345678901234567890123",
  "0x5678901234567890123456789012345678901234",
  "0x6789012345678901234567890123456789012345",
  "0x7890123456789012345678901234567890123456",
  "0x8901234567890123456789012345678901234567",
  "0x9012345678901234567890123456789012345678",
  "0x0123456789012345678901234567890123456789",
  // New mock addresses
  "0xA123456789012345678901234567890123456789",
  "0xB234567890123456789012345678901234567890",
  "0xC345678901234567890123456789012345678901",
  "0xD456789012345678901234567890123456789012",
  "0xE567890123456789012345678901234567890123",
  "0xF678901234567890123456789012345678901234",
  "0xA789012345678901234567890123456789012345",
  "0xB890123456789012345678901234567890123456",
  "0xC901234567890123456789012345678901234567",
  "0xD012345678901234567890123456789012345678"
];

// Cache for blockie images to avoid regenerating them
const blockieCache = new Map();

// Memoized blockie generator
const getBlockieImage = (address) => {
  if (!blockieCache.has(address)) {
    blockieCache.set(address, createBlockies(address));
  }
  return blockieCache.get(address);
};

// Initial player data structure - will be converted to dynamic state
const initialPlayerData = [
  { name: "anon", address: mockAddresses[0], baseAmount: 0.1 + Math.random() * 0.9, currentPercent: 0, tokenType: Math.random() > 0.5 ? 'solana' : 'rugs' },
  { name: "corksuccer", address: mockAddresses[1], baseAmount: 0.1 + Math.random() * 0.9, currentPercent: 0, tokenType: Math.random() > 0.5 ? 'solana' : 'rugs' },
  { name: "anon", address: mockAddresses[2], baseAmount: 0.1 + Math.random() * 0.9, currentPercent: 0, tokenType: Math.random() > 0.5 ? 'solana' : 'rugs' },
  { name: "kub", address: mockAddresses[3], baseAmount: 0.1 + Math.random() * 0.9, currentPercent: 0, tokenType: Math.random() > 0.5 ? 'solana' : 'rugs' },
  { name: "Krisi18", address: mockAddresses[4], baseAmount: 0.1 + Math.random() * 0.9, currentPercent: 0, tokenType: Math.random() > 0.5 ? 'solana' : 'rugs' },
  { name: "Gorillarug", address: mockAddresses[5], baseAmount: 0.1 + Math.random() * 0.9, currentPercent: 0, tokenType: Math.random() > 0.5 ? 'solana' : 'rugs' },
  { name: "Gob", address: mockAddresses[6], baseAmount: 0.1 + Math.random() * 0.9, currentPercent: 0, tokenType: Math.random() > 0.5 ? 'solana' : 'rugs' },
  { name: "Oreoz", address: mockAddresses[7], baseAmount: 0.1 + Math.random() * 0.9, currentPercent: 0, tokenType: Math.random() > 0.5 ? 'solana' : 'rugs' },
  { name: "Romms", address: mockAddresses[8], baseAmount: 0.1 + Math.random() * 0.9, currentPercent: 0, tokenType: Math.random() > 0.5 ? 'solana' : 'rugs' },
  { name: "Gob", address: mockAddresses[9], baseAmount: 0.1 + Math.random() * 0.9, currentPercent: 0, tokenType: Math.random() > 0.5 ? 'solana' : 'rugs' },
  // New mock players
  { name: "Frodo", address: mockAddresses[10], baseAmount: 0.1 + Math.random() * 0.9, currentPercent: 0, tokenType: Math.random() > 0.5 ? 'solana' : 'rugs' },
  { name: "Samwise", address: mockAddresses[11], baseAmount: 0.1 + Math.random() * 0.9, currentPercent: 0, tokenType: Math.random() > 0.5 ? 'solana' : 'rugs' },
  { name: "Gandalf", address: mockAddresses[12], baseAmount: 0.1 + Math.random() * 0.9, currentPercent: 0, tokenType: Math.random() > 0.5 ? 'solana' : 'rugs' },
  { name: "Legolas", address: mockAddresses[13], baseAmount: 0.1 + Math.random() * 0.9, currentPercent: 0, tokenType: Math.random() > 0.5 ? 'solana' : 'rugs' },
  { name: "Aragorn", address: mockAddresses[14], baseAmount: 0.1 + Math.random() * 0.9, currentPercent: 0, tokenType: Math.random() > 0.5 ? 'solana' : 'rugs' },
  { name: "Boromir", address: mockAddresses[15], baseAmount: 0.1 + Math.random() * 0.9, currentPercent: 0, tokenType: Math.random() > 0.5 ? 'solana' : 'rugs' },
  { name: "Gimli", address: mockAddresses[16], baseAmount: 0.1 + Math.random() * 0.9, currentPercent: 0, tokenType: Math.random() > 0.5 ? 'solana' : 'rugs' },
  { name: "Sauron", address: mockAddresses[17], baseAmount: 0.1 + Math.random() * 0.9, currentPercent: 0, tokenType: Math.random() > 0.5 ? 'solana' : 'rugs' },
  { name: "Saruman", address: mockAddresses[18], baseAmount: 0.1 + Math.random() * 0.9, currentPercent: 0, tokenType: Math.random() > 0.5 ? 'solana' : 'rugs' },
  { name: "Gollum", address: mockAddresses[19], baseAmount: 0.1 + Math.random() * 0.9, currentPercent: 0, tokenType: Math.random() > 0.5 ? 'solana' : 'rugs' },
];

// Helper function to calculate profit amount based on percentage and base amount
const calculateProfitAmount = (baseAmount, percentChange) => {
  if (percentChange === 0) return 0;
  
  // Calculate the profit amount based on percentage change
  const profitAmount = baseAmount * (percentChange / 100);
  
  // Always format to 3 decimal places for consistent width
  return Math.round(profitAmount * 1000) / 1000;
};

// Helper function to format percentage with proper truncation
const formatPercentage = (percent) => {
  if (percent === 0) return "0.0%";
  
  const absPercent = Math.abs(percent);
  let truncated;
  
  if (absPercent >= 1000) {
    // For 1000%+ show as 1000% (4 digits)
    truncated = Math.floor(absPercent);
  } else if (absPercent >= 100) {
    // For 100-999.x% show as 100.8% (4 digits)
    truncated = Math.floor(absPercent * 10) / 10;
  } else if (absPercent >= 10) {
    // For 10-99.xx% show as 10.78% (4 digits)
    truncated = Math.floor(absPercent * 100) / 100;
  } else {
    // For 0-9.xxx% show as 9.123% (4 digits)
    truncated = Math.floor(absPercent * 1000) / 1000;
  }
  
  const sign = percent >= 0 ? "+" : "-";
  return `${sign}${truncated}%`;
};

// Helper function to generate fluctuating percentage for a player based on chart movement
const generateFluctuatingPercent = (currentPercent, chartMultiplier, baseVariation = 0.1) => {
  // Calculate the chart's movement from 1.0x baseline
  const chartMovement = (chartMultiplier - 1.0) * 100; // Convert to percentage
  
  // Add some individual player variation (±10% by default)
  const playerVariation = (Math.random() - 0.5) * 2 * baseVariation * 100; // ±10%
  
  // Calculate target percentage based on chart movement + player variation
  const targetPercent = chartMovement + playerVariation;
  
  // Smooth transition towards target (prevents jarring jumps)
  const smoothingFactor = 0.15; // How quickly to move towards target
  const newPercent = currentPercent + (targetPercent - currentPercent) * smoothingFactor;
  
  // Add small random fluctuation for realism
  const randomFluctuation = (Math.random() - 0.5) * 2; // ±1%
  
  return newPercent + randomFluctuation;
};

const CHART_HEIGHT = 400;
const CHART_WIDTH = 800;
const CANDLE_WIDTH = 20;
const CANDLE_GAP = 6; // Back to 6 pixels
const MIN_VALUE = 0.3; // Minimum fixed value
const ABSOLUTE_MAX_VALUE = 50.0; // Theoretical maximum for calculations
const LEADERBOARD_WIDTH = 420; // Reverted to original

// Brighter, more contrasted grid line colors (top to bottom)
const gridLineColors = [
  "#FFFFFF", // white (top)
  "#FFFFFF", // white
  "#FFFFFF", // white
  "#FFFFFF", // white (center)
  "#FFFFFF", // white
  "#FFFFFF", // white
  "#FFFFFF"  // white (bottom)
];

// Add a ref to store the last used grid step
let lastGridStep = 1;

// Helper function to reset grid system
function resetGridSystem() {
  lastGridStep = 1;
}

// Dynamic grid line generation based on the current visible range
function generateGridLines(maxValue) {
  const min = MIN_VALUE;
  const possibleSteps = [0.5, 1, 2, 5, 10, 20, 50, 100];
  let step = lastGridStep;

  // Calculate range and be more dynamic with line count
  const range = maxValue - min;
  
  // More dynamic line count based on range
  const maxAllowedLines = range > 20 ? 6 : (range > 10 ? 5 : 4);
  const minAllowedLines = 3;
  
  // Find the best step with stronger hysteresis
  let bestStep = step;
  let bestCount = 1000;
  
  for (let i = 0; i < possibleSteps.length; i++) {
    const s = possibleSteps[i];
    // Fixed start calculation to allow grid lines below 1x
    const start = Math.ceil(min / s) * s;
    const end = Math.floor(maxValue / s) * s;
    const count = Math.floor((end - start) / s) + 1;
    
    if (count >= minAllowedLines && count <= maxAllowedLines) {
      // Strong preference to keep current step (hysteresis)
      if (s === step) {
        bestStep = s;
        bestCount = count;
        break;
      }
      
      // Only switch if current step is clearly problematic
      const currentStepStart = Math.ceil(min / step) * step;
      const currentStepCount = Math.floor((Math.floor(maxValue / step) * step - currentStepStart) / step) + 1;
      if (currentStepCount > maxAllowedLines + 1 || currentStepCount < minAllowedLines) {
        if (Math.abs(count - (maxAllowedLines + minAllowedLines) / 2) < Math.abs(bestCount - (maxAllowedLines + minAllowedLines) / 2)) {
          bestStep = s;
          bestCount = count;
        }
      }
    }
  }
  
  step = bestStep;
  lastGridStep = step;

  // Use the corrected start calculation
  const start = Math.ceil(min / step) * step;
  const end = Math.floor(maxValue / step) * step;
  const multipliers = [];
  
  // Generate grid lines with dynamic limit
  for (let v = start; v <= end + 0.0001; v += step) {
    if (multipliers.length >= maxAllowedLines) break;
    multipliers.push(Number(v.toFixed(4)));
  }

  // Always include 1.0x if it's in range and we have space
  if (1.0 >= start && 1.0 <= end && !multipliers.includes(1.0) && multipliers.length < maxAllowedLines) {
    multipliers.push(1.0);
    multipliers.sort((a, b) => a - b);
  }

  return multipliers;
}

// Memoized components for better performance
const Logo = React.memo(() => {
  return (
    <div className="logo-container">
      <h1 className="logo-text">RUGS.FUN</h1>
      <span className="beta-tag">BETA</span>
    </div>
  );
});

const TestControls = React.memo(({ onStartTest, isRunning, onStopTest, onTestGameStates }) => {
  return (
    <div className="test-controls">
      {!isRunning ? (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <button 
            className="test-button state-test" 
            onClick={onTestGameStates}
            style={{ background: 'linear-gradient(90deg, #3B6EFF, #FFDC40)' }}
          >
            Start Sim
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <button className="test-button stop" onClick={onStopTest}>
            Stop Test
          </button>
        </div>
      )}
      <div className="test-info">
        The "Start Sim" button demonstrates the complete game cycle with dynamic leaderboard updates
      </div>
      <div style={{
        marginTop: '8px',
        fontSize: '13px',
        color: '#ffb347',
        textAlign: 'center',
        maxWidth: '350px',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}>
        If you stop the test the demo websocket geeks out so instead of hitting start again just refresh to see it again
      </div>
    </div>
  );
});

const PlayerBox = React.memo(({ player, index, animatedValues }) => {
  // Handle both old static format and new dynamic format
  let profitAmount, formattedProfit, formattedPercent;
  
  // Use animated values if available, otherwise fall back to player values
  const playerId = `${player.address}-${index}`;
  const animated = animatedValues?.[playerId];
  
  if (typeof player.currentPercent === 'number') {
    // New dynamic format - use animated values if available
    const currentPercent = animated?.percent ?? player.currentPercent;
    const currentProfit = animated?.profit ?? parseFloat(player.profit?.replace('+', '') || '0');
    
    profitAmount = currentProfit;
    formattedProfit = profitAmount === 0 ? "0.000" : (profitAmount > 0 ? `+${profitAmount.toFixed(3)}` : `${profitAmount.toFixed(3)}`);
    formattedPercent = formatPercentage(currentPercent);
  } else {
    // Old static format - fallback
    profitAmount = parseFloat(player.profit?.replace("+", "") || "0");
    formattedProfit = player.profit || "0.000";
    formattedPercent = player.percent || "0.0%";
  }
  
  const blockieImage = getBlockieImage(player.address);
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 640;
  const isSmallScreen = typeof window !== 'undefined' && window.innerWidth > 640 && window.innerWidth <= 900;

  // Check if this is the top player (first place)
  const isTopPlayer = index === 0;
  
  // Determine if this row should be light or dark gray
  const isEvenRow = index % 2 === 0;

  // Nintendo-style color schemes
  const nintendoColors = {
    topPlayer: {
      main: 'linear-gradient(135deg, #4C1D95 0%, #3730A3 25%, #312E81 50%, #1E1B4B 75%, #0F0F23 100%)', // Darker, richer purple gradient
      darker: 'linear-gradient(135deg, #312E81 0%, #1E1B4B 25%, #0F0F23 50%, #0A0A1A 75%, #050510 100%)', // Even darker purple
      border: '#6366F1', // Rich indigo border
      shadow: 'rgba(99, 102, 241, 0.4)' // Indigo shadow
    },
    evenRow: {
      main: 'linear-gradient(135deg, #0D1421 0%, #1A2332 25%, #243447 50%, #2E4057 75%, #3A4D63 100%)',
      darker: 'linear-gradient(135deg, #070A0F 0%, #0D1421 25%, #1A2332 50%, #243447 75%, #2E4057 100%)',
      border: '#00D4FF',
      shadow: 'rgba(0, 212, 255, 0.4)'
    },
    oddRow: {
      main: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 25%, #0F3460 50%, #0E4B99 75%, #2E8B57 100%)',
      darker: 'linear-gradient(135deg, #0F0F1A 0%, #1A1A2E 25%, #16213E 50%, #0F3460 75%, #0E4B99 100%)',
      border: '#00FF88',
      shadow: 'rgba(0, 255, 136, 0.4)'
    }
  };

  const colorScheme = isTopPlayer ? nintendoColors.topPlayer : 
                     (isEvenRow ? nintendoColors.evenRow : nintendoColors.oddRow);

  const barStyle = {
    background: colorScheme.main,
    borderRadius: isMobile ? '6px' : '8px', // Restore the rounded corners from reference
    border: 'none', // Remove default border to control each side individually
    borderTop: `2px solid ${colorScheme.border}`, // Colored stroke on top
    borderLeft: `2px solid ${colorScheme.border}`, // Colored stroke on left
    borderBottom: `2px solid rgba(0, 0, 0, 0.4)`, // Dark border on bottom for depth
    borderRight: `2px solid rgba(0, 0, 0, 0.3)`, // Dark border on right for depth
    boxShadow: `
      0 4px 8px ${colorScheme.shadow},
      0 2px 4px rgba(0, 0, 0, 0.3),
      inset 0 2px 0 rgba(255, 255, 255, 0.6),
      inset 0 -2px 0 rgba(0, 0, 0, 0.2)
    `,
    display: 'flex',
    alignItems: 'center',
    padding: isMobile ? '6px 2px 6px 4px' : (isSmallScreen ? '10px 6px' : '12px 8px'),
    margin: isMobile ? '3px 0' : '6px 0',
    minHeight: isMobile ? '24px' : (isSmallScreen ? '32px' : '36px'),
    gap: isMobile ? '4px' : (isSmallScreen ? '8px' : '10px'),
    width: '100%',
    position: 'relative',
    boxSizing: 'border-box',
    // Add smooth transitions for animated reordering
    transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
    transform: 'translateY(0)', // Base transform for animation
  };

  // Style for the slashed section that holds the percentage
  const slashSectionStyle = {
    position: 'absolute',
    right: '0',
    top: '0',
    bottom: '0',
    width: isMobile ? '50px' : (isSmallScreen ? '58px' : '68px'), // Smaller on mobile
    // Strong gradients like the candles instead of radial glow
    background: player.currentPercent >= 0 
      ? 'linear-gradient(135deg, #00dd00 0%, #00cc00 25%, #00bb00 50%, #00aa00 75%, #009900 100%)'
      : 'linear-gradient(135deg, #F44336 0%, #D32F2F 25%, #C62828 50%, #B71C1C 75%, #8B1A1A 100%)',
    clipPath: isMobile ? 'polygon(8px 0%, 100% 0%, 100% 100%, 0% 100%)' : 'polygon(12px 0%, 100% 0%, 100% 100%, 0% 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: isMobile ? '6px' : '10px',
    zIndex: 2,
    borderRadius: isMobile ? '0 4px 4px 0' : '0 6px 6px 0', // Restore rounded corners on right side
    // Clean shadow without glow
    boxShadow: player.currentPercent >= 0 
      ? '0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
      : '0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
    // Smooth Nintendo-style transitions for value changes
    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    // Add subtle Nintendo-style hover effect
    cursor: 'default',
  };

  const textStyle = {
    fontFamily: 'Chewy, cursive',
    color: '#FFFFFF',
    fontSize: isMobile ? '0.75rem' : (isSmallScreen ? '0.85rem' : '0.95rem'),
    letterSpacing: '0.5px',
    textShadow: isTopPlayer 
      ? '0 0 6px rgba(99,102,241,0.6), 0 0 12px rgba(99,102,241,0.3)' // Clean indigo glow for top player
      : '-1px -1px 0 #0A1929, 1px -1px 0 #0A1929, -1px 1px 0 #0A1929, 1px 1px 0 #0A1929, 0 0 6px rgba(0,212,255,0.4), 0 0 10px rgba(0,255,136,0.2)',
    marginRight: isMobile ? '4px' : '8px',
    whiteSpace: 'nowrap',
    fontWeight: '700',
  };

  const playerNameSpecificStyle = {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flexShrink: 1,
    minWidth: 0,
    textShadow: isTopPlayer 
      ? '0 0 6px rgba(99,102,241,0.6), 0 0 12px rgba(99,102,241,0.3)' // Clean indigo glow for top player
      : '-1px -1px 0 #0A1929, 1px -1px 0 #0A1929, -1px 1px 0 #0A1929, 1px 1px 0 #0A1929, 0 0 8px rgba(0,212,255,0.5), 0 0 12px rgba(0,255,136,0.3)',
  };

  const statStyle = {
    ...textStyle,
    marginRight: 0,
    marginLeft: isMobile ? 'auto' : '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    textShadow: isTopPlayer 
      ? '0 0 6px rgba(99,102,241,0.6), 0 0 12px rgba(99,102,241,0.3)' // Clean indigo glow for top player
      : '-1px -1px 0 #0A1929, 1px -1px 0 #0A1929, -1px 1px 0 #0A1929, 1px 1px 0 #0A1929, 0 0 6px rgba(0,212,255,0.4), 0 0 10px rgba(0,255,136,0.2)',
  };

  return (
    <div 
      className="player-row" 
      style={barStyle}
    >
      {/* Player avatar with Nintendo-style border */}
      <div className="avatar-container" style={{ marginRight: isMobile ? '1px' : (isSmallScreen ? '3px' : '4px') }}>
        <img
          src={blockieImage}
          alt="Player Avatar"
          className="player-avatar-blockie"
          style={{
            width: isMobile ? 14 : (isSmallScreen ? 18 : 20),
            height: isMobile ? 14 : (isSmallScreen ? 18 : 20),
            borderRadius: '50%', // Restore circular avatar from reference
            border: `2px solid ${colorScheme.border}`,
            boxShadow: `
              0 2px 4px rgba(0,0,0,0.4),
              inset 0 1px 0 rgba(255,255,255,0.6),
              0 0 0 1px rgba(255,255,255,0.3)
            `,
          }}
        />
      </div>
      
      {/* Player name */}
      <span className="player-name" style={{
        ...textStyle, 
        ...playerNameSpecificStyle,
        marginRight: isMobile ? '50px' : 'auto', // Account for slant section on mobile, auto for desktop
        flex: isMobile ? '1' : 'initial', // Take available space on mobile
        maxWidth: isMobile ? 'calc(100% - 70px)' : 'none', // Ensure it doesn't overflow on mobile
      }}>{player.name}</span>
      
      {/* Player profit - ONLY show on non-mobile */}
      {!isMobile && (
        <div className="player-stats" style={{...statStyle, marginLeft: 'auto', marginRight: isSmallScreen ? '78px' : '88px'}}> {/* Increased margin from slash section */}
          <span className="player-profit" style={{ 
            fontSize: isMobile ? '0.6rem' : (isSmallScreen ? '0.7rem' : '0.75rem'), // Match percentage text size
            color: isTopPlayer 
              ? (profitAmount >= 0 ? '#00FF88' : '#FF4444') // Green for positive, red for negative on purple (changed from cyan)
              : (profitAmount >= 0 ? '#00FF88' : '#FF4444'), // Original colors for other rows
            textShadow: isTopPlayer 
              ? '0 0 6px rgba(99,102,241,0.6), 0 0 12px rgba(99,102,241,0.3)' // Clean indigo glow for both colors
              : `-1px -1px 0 #0A1929, 1px -1px 0 #0A1929, -1px 1px 0 #0A1929, 1px 1px 0 #0A1929, 0 0 8px ${profitAmount >= 0 ? 'rgba(0,255,136,0.8)' : 'rgba(255,68,68,0.8)'}, 0 0 12px ${profitAmount >= 0 ? 'rgba(0,255,136,0.4)' : 'rgba(255,68,68,0.4)'}`,
            fontWeight: '800',
            fontFamily: 'Chewy, cursive', // Changed from Candal to Chewy for consistency
            display: 'flex',
            alignItems: 'center',
            // Add smooth transitions for rolling number effect
            transition: 'color 0.3s ease, text-shadow 0.3s ease',
          }}>
            <img
              src={player.tokenType === 'solana' ? solanaLogo : rugsLogo}
              alt={player.tokenType === 'solana' ? 'Solana' : 'Rugs'}
              width={isSmallScreen ? '9' : '11'}
              height={isSmallScreen ? '9' : '11'}
              style={{ 
                marginRight: '3px', 
                verticalAlign: 'middle', 
                opacity: 0.95,
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.6))'
              }}
            />
            {formattedProfit.replace("+", "")}
          </span>
        </div>
      )}
      
      {/* Slashed section for percentage with enhanced styling */}
      <div style={slashSectionStyle}>
        <span style={{ 
          fontSize: isMobile ? '0.6rem' : (isSmallScreen ? '0.7rem' : '0.75rem'),
          color: '#FFFFFF', // White text for both green and red backgrounds
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.8), 0 0 4px rgba(0, 0, 0, 0.4)', // Clean shadow for depth
          fontWeight: '800',
          fontFamily: 'Chewy, cursive', // Changed from Candal to Chewy for consistency
          zIndex: 2,
          // Add smooth transitions for rolling percentage effect with Nintendo-style easing
          transition: 'color 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), text-shadow 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}>
          {formattedPercent}
        </span>
      </div>
    </div>
  );
});

// Memoized trade marker for performance - only re-render when props change
const TradeMarker = React.memo(({ trade, x, y, opacity = 1, candleX }) => {
  // Smaller dimensions for the notification box to match the image
  const boxWidth = 95;
  const boxHeight = 36;

  // Color based on trade type (buy = green, sell = red)
  const color = trade.type === 'buy' ? '#00FF00' : '#ff0000'; // Pure green and red
  const glowColor = trade.type === 'buy' ? 'rgba(0, 255, 0, 0.9)' : 'rgba(255, 0, 0, 0.9)';

  // Layout constants
  const logoSize = 14;
  const cornerLength = 15; // Slightly longer corners
  const cornerThickness = 2.2; // Slightly thicker corners
  
  return (
    <g className="trade-marker" opacity={opacity}>
      {/* Semi-transparent black background box */}
      <rect
        x={x}
        y={y - boxHeight/2}
        width={boxWidth}
        height={boxHeight}
        rx={4}
        ry={4}
        fill="rgba(23, 23, 35, 0.94)"
        stroke="none"
      />
      
      {/* Define filter for stronger cyberpunk glow effect */}
      <defs>
        <filter id={`neon-glow-${trade.id}`}>
          <feFlood floodColor={glowColor} result="flood" />
          <feComposite operator="in" in="flood" in2="SourceAlpha" result="colored-alpha"/>
          <feGaussianBlur in="colored-alpha" stdDeviation="2.5" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Draw four corners with enhanced neon glow effect */}
      <g style={{ filter: `url(#neon-glow-${trade.id})` }}>
        {/* Top-left corner */}
        <line x1={x} y1={y - boxHeight/2 + cornerLength} x2={x} y2={y - boxHeight/2} stroke={color} strokeWidth={cornerThickness} strokeLinecap="round" />
        <line x1={x} y1={y - boxHeight/2} x2={x + cornerLength} y2={y - boxHeight/2} stroke={color} strokeWidth={cornerThickness} strokeLinecap="round" />
        
        {/* Top-right corner */}
        <line x1={x + boxWidth - cornerLength} y1={y - boxHeight/2} x2={x + boxWidth} y2={y - boxHeight/2} stroke={color} strokeWidth={cornerThickness} strokeLinecap="round" />
        <line x1={x + boxWidth} y1={y - boxHeight/2} x2={x + boxWidth} y2={y - boxHeight/2 + cornerLength} stroke={color} strokeWidth={cornerThickness} strokeLinecap="round" />
        
        {/* Bottom-right corner */}
        <line x1={x + boxWidth} y1={y + boxHeight/2 - cornerLength} x2={x + boxWidth} y2={y + boxHeight/2} stroke={color} strokeWidth={cornerThickness} strokeLinecap="round" />
        <line x1={x + boxWidth} y1={y + boxHeight/2} x2={x + boxWidth - cornerLength} y2={y + boxHeight/2} stroke={color} strokeWidth={cornerThickness} strokeLinecap="round" />
        
        {/* Bottom-left corner */}
        <line x1={x} y1={y + boxHeight/2 - cornerLength} x2={x} y2={y + boxHeight/2} stroke={color} strokeWidth={cornerThickness} strokeLinecap="round" />
        <line x1={x} y1={y + boxHeight/2} x2={x + cornerLength} y2={y + boxHeight/2} stroke={color} strokeWidth={cornerThickness} strokeLinecap="round" />
        
        {/* Enhanced connector line with a dot at the end - now points directly to middle of candle */}
        <line
          x1={x + boxWidth}
          y1={y}
          x2={candleX}
          y2={y}
          stroke={color}
          strokeWidth={1.5}
          strokeDasharray="1 2"
        />
        <circle 
          cx={candleX} 
          cy={y} 
          r={2} 
          fill={color} 
        />
      </g>
      
      {/* Token logo and info in a compact layout */}
      <svg x={x + 8} y={y - logoSize/2} width={logoSize} height={logoSize} viewBox="0 0 20 20">
        <defs>
          <clipPath id={`token-clip-${trade.id}`}>
            <circle cx="10" cy="10" r="10" />
          </clipPath>
        </defs>
        <image
          href={trade.token.logo}
          width="20"
          height="20"
          clipPath={`url(#token-clip-${trade.id})`}
        />
      </svg>
      
      {/* Username in monospace font */}
      <text
        x={x + 8 + logoSize + 6}
        y={y - 5}
        fontSize="10"
        fontFamily="monospace"
        fill="#FFFFFF"
        textAnchor="start"
        dominantBaseline="middle"
      >
        {trade.username.length >= 8 ? trade.username.substring(0, 6) + '..' : trade.username}
      </text>
      
      {/* Buy/Sell text with amount in colored text */}
      <text
        x={x + 8 + logoSize + 6}
        y={y + 10}
        fontSize="10"
        fontFamily="monospace"
        fill={color}
        textAnchor="start"
        dominantBaseline="middle"
        fontWeight="bold"
      >
        {trade.type.toUpperCase()} {trade.amount.toFixed(1)}
      </text>
    </g>
  );
});

function GameGraph() {
  const [chartData, setChartData] = useState(initialMockChartData);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [visibleMaxValue, setVisibleMaxValue] = useState(2.0);
  const [displayMultiplier, setDisplayMultiplier] = useState(1.0);
  const [currentTick, setCurrentTick] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [containerHeight, setContainerHeight] = useState(400); // Add container height state
  
  // Add dynamic player data state
  const [playersData, setPlayersData] = useState(initialPlayerData);
  
  // Add state for animated player values (rolling numbers)
  const [animatedPlayerValues, setAnimatedPlayerValues] = useState({});
  const playerAnimationRefs = useRef({});
  
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);
  
  // Add ref for chart container to avoid DOM queries during render
  const chartContainerRef = useRef(null);
  
  // Add mouse event handlers for dragging
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startHeightRef.current = containerHeight;
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDraggingRef.current) return;
    
    const deltaY = startYRef.current - e.clientY;
    const newHeight = Math.max(200, Math.min(800, startHeightRef.current + deltaY));
    setContainerHeight(newHeight);
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!isDraggingRef.current) return;
    
    isDraggingRef.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  // Add and remove event listeners
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);
  
  // Simplify animation approach - just track the last price for bounce animation
  const [animatedPrice, setAnimatedPrice] = useState(null);
  const [animatedHigh, setAnimatedHigh] = useState(null);
  const [animatedLow, setAnimatedLow] = useState(null);
  const priceAnimationRef = useRef(null);
  const actualPriceRef = useRef(null);
  
  // Change from single activeTrade to array of active trades
  const [activeTradesMap, setActiveTradesMap] = useState({});
  const [tradeOpacity, setTradeOpacity] = useState(1);
  
  // Add game state management
  const [gameState, setGameState] = useState('inactive'); // 'inactive', 'presale', 'active', 'rugged'
  const [countdownTime, setCountdownTime] = useState(5); // 5 seconds countdown
  
  // Add scaling state to prevent grid line updates during scaling animation
  const [isScaling, setIsScaling] = useState(false);
  const [stableGridLines, setStableGridLines] = useState([]);
  
  // Use refs to maintain references between renders
  const testIntervalRef = useRef(null);
  const animationFrameRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  
  // Add a ref to track the absolute candle index from the start of simulation
  const absoluteCandleIndexRef = useRef(0);
  
  // Add a ref to track when we switch to a new candle for animation reset
  const lastCandleCountRef = useRef(0);
  
  // Add a ref to track the current candle's open price for proper wick reset
  const currentCandleOpenRef = useRef(null);
  
  const previousMultiplierRef = useRef(currentMultiplier);
  const lastTradeTimeRef = useRef(0);
  const fadeTimeoutRef = useRef(null);
  const rugTimerRef = useRef(null);
  const scalingAnimationRef = useRef(null);
  const gridUpdateTimeoutRef = useRef(null);
  
  // Track if game is rugged to prevent any more updates
  const isRugged = gameState === 'rugged';
  
  // Determine responsive flags
  const isMobile = windowWidth <= 640;
  const isSmall = windowWidth > 640 && windowWidth <= 900;

  // Base responsive leaderboard width
  let baseResponsiveLeaderboardWidth;
  if (isMobile) {
    baseResponsiveLeaderboardWidth = 160;
  } else if (isSmall) {
    baseResponsiveLeaderboardWidth = 240;
  } else {
    baseResponsiveLeaderboardWidth = 320;
  }

  // Calculate the desired width (base + 15%)
  const dynamicLeaderboardWidth = baseResponsiveLeaderboardWidth * 0.8625; // Adjusted: base * 1.15 * 0.75
  
  // Use memoization for chart data with game state
  const displayedChartData = useMemo(() => {
    // Always use the direct chart data, no special handling needed
    return chartData;
  }, [chartData]);
  
  // Memoize the trades as well to prevent updates
  const displayedTrades = useMemo(() => {
    // Always use the direct trades data, no special handling needed
    return activeTradesMap;
  }, [activeTradesMap]);
  
  // Optimize window resize listener with throttling
  useEffect(() => {
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowWidth(window.innerWidth);
      }, 100); // Throttle resize events
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);
  
  // Generate grid lines based on the current visible range - memoized for performance
  // Use stable grid lines during scaling to prevent flashing
  const gridLineMultipliers = useMemo(() => {
    return isScaling ? stableGridLines : generateGridLines(visibleMaxValue);
  }, [isScaling, stableGridLines, visibleMaxValue]);
  
  // Normalize function for calculating y positions based on visible range - memoized
  const norm = useCallback((v) => {
    // STRENGTHENED NORMALIZATION with multiple safeguards
    
    // For rugged state, ensure we can see values down to zero
    if (gameState === 'rugged') {
      const ruggedMin = 0;
      const range = visibleMaxValue - ruggedMin;
      // Much stronger minimum range enforcement for rugged state
      if (range < 1.0) {
        // Force reasonable positioning when range is too small
        const safeRange = Math.max(range, 1.0);
        const safeMaxValue = ruggedMin + safeRange;
        return CHART_HEIGHT - (((v - ruggedMin) / safeRange) * (CHART_HEIGHT - 40) + 20);
      }
      return CHART_HEIGHT - (((v - ruggedMin) / range) * (CHART_HEIGHT - 40) + 20);
    }
    
    // Normal case - simplified normalization
    const range = visibleMaxValue - MIN_VALUE;
    const CRITICAL_MIN_RANGE = 1.0; // Reduced to allow natural scaling in 1-5x range
    
    // Only use emergency fallback for truly problematic ranges
    if (range < CRITICAL_MIN_RANGE) {
      console.warn(`Chart condensing detected! Range: ${range}, using fallback positioning`);
      // Use a minimal safe range 
      const safeRange = CRITICAL_MIN_RANGE;
      const safeMaxValue = MIN_VALUE + safeRange;
      const normalizedValue = Math.max(MIN_VALUE, Math.min(v, safeMaxValue));
      return CHART_HEIGHT - (((normalizedValue - MIN_VALUE) / safeRange) * (CHART_HEIGHT - 40) + 20);
    }
    
    // Normal case with validated range
    const clampedValue = Math.max(MIN_VALUE, Math.min(v, visibleMaxValue));
    return CHART_HEIGHT - (((clampedValue - MIN_VALUE) / range) * (CHART_HEIGHT - 40) + 20);
  }, [gameState, visibleMaxValue]);
  
  // Get the last (most recent) candle's value
  // Always default to 1.0 if no candles are available to match production
  const lastCandleValue = chartData.length > 0 ? chartData[chartData.length - 1].close : 1.0;
  
  // Function to generate a new price point with smoother but still dramatic movements
  const generateNextPrice = (currentPrice) => {
    // Base movement - more dramatic now
    const randomFactor = Math.random() * 0.15 - 0.075; // Between -0.075 and 0.075
    
    // For smoother transitions with more frequent updates, scale the jumps appropriately
    const bigJumpChance = 0.4; // Reduced chance of big jumps from 60% to 40%
    let trendValue = 0;
    
    if (Math.random() < bigJumpChance) {
      // Big movement - more controlled to prevent extreme outliers
      const direction = Math.random() < 0.5 ? 1 : -1; // Equal chance up or down
      const magnitude = Math.random() * 0.2 + 0.1; // 10% to 30% jump (reduced from 15% to 45%)
      trendValue = direction * magnitude;
    } else {
      // Normal movement (still quite large)
      trendValue = Math.random() < 0.5 ? 0.08 : -0.06; // More balanced movements
    }
    
    // Calculate new price with more controlled movement
    let newPrice = currentPrice * (1 + randomFactor + trendValue);
    
    // More aggressive bounds checking
    // Keep values in a more reasonable range for visualization
    const maxAllowedMultiplier = Math.max(visibleMaxValue * 0.8, 100.0); // Cap at current view * 0.8 or 100x
    newPrice = Math.max(MIN_VALUE + 0.1, Math.min(maxAllowedMultiplier, newPrice));
    
    return parseFloat(newPrice.toFixed(4));
  };
  
  // Function to generate a new trade marker - optimized with useCallback
  const generateTrade = useCallback((candleIndex, price) => {
    // Randomly select a player and token
    const playerIndex = Math.floor(Math.random() * playersData.length);
    const player = playersData[playerIndex];
    const tokenIndex = Math.floor(Math.random() * mockTokens.length);
    const token = mockTokens[tokenIndex];
    
    // Decide if it's a buy or sell
    const type = Math.random() > 0.5 ? 'buy' : 'sell';
    
    // Generate random amount (between 0.1 and 2.0)
    const amount = 0.1 + Math.random() * 1.9;
    
    // Create a unique ID using timestamp and random number
    const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    return {
      id: uniqueId,
      candleIndex,             // Store relative candle index in current chart data
      absoluteCandleIndex: absoluteCandleIndexRef.current,  // Store absolute candle index
      price,                   // Store the actual price (for vertical positioning)
      username: player.name,
      address: player.address,
      token,
      type,
      amount,
      timestamp: Date.now(),
      opacity: 1,              // Start fully visible
    };
  }, [playersData]);
  
  // Function to add a new trade
  const addNewTrade = (trade) => {
    setActiveTradesMap(prev => ({
      ...prev,
      [trade.id]: trade
    }));
    
    // Start fade out after 2.5 seconds
    setTimeout(() => {
      const fadeOutInterval = setInterval(() => {
        setActiveTradesMap(prev => {
          const currentTrade = prev[trade.id];
          if (!currentTrade) {
            clearInterval(fadeOutInterval);
            return prev;
          }
          
          // Reduce opacity
          const newOpacity = currentTrade.opacity - 0.03;
          
          if (newOpacity <= 0) {
            // Remove the trade when fully faded
            const newMap = {...prev};
            delete newMap[trade.id];
            clearInterval(fadeOutInterval);
            return newMap;
          }
          
          // Update opacity
          return {
            ...prev,
            [trade.id]: {
              ...currentTrade,
              opacity: newOpacity
            }
          };
        });
      }, 50);
    }, 2500);
  };
  
  // Use effect to handle countdown - using requestAnimationFrame for precise timing
  useEffect(() => {
    if (gameState === 'presale' && countdownTime > 0) {
      let startTime = null;
      let initialCountdown = countdownTime;
      let animationFrameId = null;
      
      const updateCountdown = (timestamp) => {
        if (!startTime) startTime = timestamp;
        
        const elapsedMs = timestamp - startTime;
        const remainingTime = Math.max(0, initialCountdown - (elapsedMs / 1000));
        
        setCountdownTime(remainingTime);
        
        if (remainingTime <= 0.05) {
          // When countdown reaches ~0, change to active state
          setGameState('active');
          return; // Stop animation
        }
        
        animationFrameId = requestAnimationFrame(updateCountdown);
      };
      
      // Start the animation frame loop
      animationFrameId = requestAnimationFrame(updateCountdown);
      
      // Store the animation frame ID in the ref for cleanup
      countdownIntervalRef.current = () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    }
    
    return () => {
      if (typeof countdownIntervalRef.current === 'function') {
        countdownIntervalRef.current();
      }
    };
  }, [gameState, countdownTime === 5]); // Only trigger when countdownTime is 5 (initial value)
  
  // Handle candle generation when in active state
  useEffect(() => {
    if (gameState === 'active') {
      startCandleGeneration();
    } else if (testIntervalRef.current) {
      clearInterval(testIntervalRef.current);
      testIntervalRef.current = null;
    }
  }, [gameState]);
  
  // Function to start test simulation
  const startTestSimulation = () => {
    setIsTestRunning(true);
    
    // Clear previous chart data
    setChartData([]);
    setActiveTradesMap({});
    
    // Reset values
    setCurrentMultiplier(1.0);
    setVisibleMaxValue(2.0);
    setCurrentTick(0);
    absoluteCandleIndexRef.current = 0;
    
    // Reset animated price values
    setAnimatedPrice(null);
    setAnimatedHigh(null);
    setAnimatedLow(null);
    setDisplayMultiplier(1.0);
    
    // Reset player data to initial state
    setPlayersData(initialPlayerData.map(player => ({
      ...player,
      baseAmount: 0.1 + Math.random() * 0.9, // Randomize base amounts again
      currentPercent: 0
    })));
    
    // Reset grid system
    resetGridSystem();
    
    // Start in presale mode
    setGameState('presale');
    setCountdownTime(5);
  };
  
  // Function to start generating candle data
  const startCandleGeneration = () => {
    if (testIntervalRef.current) return;
    
    // Initialize with starting candle
    const initialCandle = { 
      high: 1.0, 
      low: 1.0, 
      open: 1.0, 
      close: 1.0, 
      timestamp: Date.now(),
      absoluteIndex: absoluteCandleIndexRef.current
    };
    
    setChartData([initialCandle]);
    
    // IMMEDIATELY set the current multiplier to ensure player updates start right away
    setCurrentMultiplier(1.0);
    
    testIntervalRef.current = setInterval(() => {
      setCurrentTick(prevTick => {
        const newTick = prevTick + 1;
        
        
        setChartData(prevData => {
          // Ensure we have data to work with
          if (prevData.length === 0) {
            return [initialCandle];
          }
          
          const lastCandle = prevData[prevData.length - 1];
          const newPrice = generateNextPrice(lastCandle.close);
          
          // Generate trades randomly
          const currentTime = Date.now();
          if (currentTime - lastTradeTimeRef.current >= 2000) {
            if (Math.random() < 0.35) {
              const candleIndex = prevData.length - 1;
              const newTrade = generateTrade(candleIndex, newPrice);
              addNewTrade(newTrade);
              lastTradeTimeRef.current = currentTime;
            }
          }
          
          // Every 5 ticks, create a new candle
          if (newTick % 5 === 0) {
            absoluteCandleIndexRef.current++;
            
            const newCandle = {
              high: Math.max(lastCandle.close, newPrice),
              low: Math.min(lastCandle.close, newPrice),
              open: lastCandle.close,
              close: newPrice,
              timestamp: Date.now(),
              absoluteIndex: absoluteCandleIndexRef.current
            };
            
            const newData = [...prevData, newCandle];
            if (newData.length > 20) {
              return newData.slice(-20);
            }
            return newData;
          } else {
            // Update current candle
            const updatedCandle = {
              ...lastCandle,
              high: Math.max(lastCandle.high, newPrice),
              low: Math.min(lastCandle.low, newPrice),
              close: newPrice
            };
            
            const newData = [...prevData];
            newData[newData.length - 1] = updatedCandle;
            return newData;
          }
        });
        
        // Update multiplier
        setChartData(currentData => {
          if (currentData.length === 0) return currentData;
          const lastCandle = currentData[currentData.length - 1];
          setCurrentMultiplier(lastCandle.close);
          return currentData;
        });
        
        return newTick;
      });
    }, 250);
  };
  
  // Handle rugging the game
  const rugGame = () => {
    // If already rugged, do nothing
    if (gameState === 'rugged') return;
    
    console.log('GAME RUGGED - Creating final crash candle');
    
    // Stop intervals
    if (testIntervalRef.current) {
      clearInterval(testIntervalRef.current);
      testIntervalRef.current = null;
    }
    
    // Set all players to large negative percentages (they lost everything)
    setPlayersData(prevPlayers => {
      return prevPlayers.map(player => ({
        ...player,
        currentPercent: -80 - Math.random() * 20 // Between -80% and -100%
      })).sort((a, b) => b.currentPercent - a.currentPercent); // Sort by percentage descending (least negative first)
    });
    
    // Create a final crash candle
    setChartData(prevData => {
      if (prevData.length === 0) return prevData;
      
      const lastCandle = prevData[prevData.length - 1];
      const rugCandle = {
        high: lastCandle.close,
        low: 0, // Change from 0.01 to 0
        open: lastCandle.close,
        close: 0, // Change from 0.01 to 0
        timestamp: Date.now(),
        absoluteIndex: absoluteCandleIndexRef.current + 1,
        isRugCandle: true
      };
      
      return [...prevData, rugCandle];
    });
    
    // Update state to rugged - set currentMultiplier to 0 but DON'T set displayMultiplier
    // This allows the animation to run and show the drop to 0
    setGameState('rugged');
    setCurrentMultiplier(0);
  };
  
  // Function to stop test
  const stopTestSimulation = () => {
    // Clean up intervals
    if (testIntervalRef.current) {
      clearInterval(testIntervalRef.current);
      testIntervalRef.current = null;
    }
    
    // Clean up countdown
    if (typeof countdownIntervalRef.current === 'function') {
      countdownIntervalRef.current();
      countdownIntervalRef.current = null;
    }
    
    // Clean up all animation frames
    if (priceAnimationRef.current) {
      cancelAnimationFrame(priceAnimationRef.current);
      priceAnimationRef.current = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (scalingAnimationRef.current) {
      cancelAnimationFrame(scalingAnimationRef.current);
      scalingAnimationRef.current = null;
    }
    
    if (gridUpdateTimeoutRef.current) {
      clearTimeout(gridUpdateTimeoutRef.current);
      gridUpdateTimeoutRef.current = null;
    }
    
    // Reset state
    setIsTestRunning(false);
    setGameState('inactive');
    setCountdownTime(5);
    setChartData([]);
    setActiveTradesMap({});
    
    // Reset view and animation states
    setVisibleMaxValue(2.0);
    setCurrentMultiplier(1.0);
    setDisplayMultiplier(1.0);
    setAnimatedPrice(null);
    setAnimatedHigh(null);
    setAnimatedLow(null);
    setIsScaling(false);
    setStableGridLines([]);
    
    // Reset grid system
    resetGridSystem();
  };
  
  // Function to handle websocket messages (simulated)
  const handleWebSocketMessage = (message) => {
    if (!message) return;
    
    console.log('Received WebSocket message:', message);
    
    // Handle different message types
    if (message.type === 'price') {
      // Price update for active game
      if (gameState === 'active') {
        // Update candle with new price
        setChartData(prevData => {
          if (prevData.length === 0) {
            const newCandle = {
              high: message.price, 
              low: message.price, 
              open: message.price, 
              close: message.price,
              timestamp: Date.now(),
              absoluteIndex: absoluteCandleIndexRef.current
            };
            return [newCandle];
          }
          
          const lastCandle = prevData[prevData.length - 1];
          
          // Update existing candle or create new one based on tick logic
          // In a real implementation, this would follow your backend's candle creation rules
          const updatedCandle = {
            ...lastCandle,
            high: Math.max(lastCandle.high, message.price),
            low: Math.min(lastCandle.low, message.price),
            close: message.price
          };
          
          const newData = [...prevData];
          newData[newData.length - 1] = updatedCandle;
          
          // Update multiplier
          setCurrentMultiplier(message.price);
          
          return newData;
        });
      }
    } 
    else if (message.type === 'gameState') {
      // Game state update
      if (message.state === 'presale') {
        console.log('Game entering presale state');
        
        // Clean up any ongoing animations first
        if (scalingAnimationRef.current) {
          cancelAnimationFrame(scalingAnimationRef.current);
          scalingAnimationRef.current = null;
        }
        
        if (gridUpdateTimeoutRef.current) {
          clearTimeout(gridUpdateTimeoutRef.current);
          gridUpdateTimeoutRef.current = null;
        }
        
        if (priceAnimationRef.current) {
          cancelAnimationFrame(priceAnimationRef.current);
          priceAnimationRef.current = null;
        }
        
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        
        setGameState('presale');
        setCountdownTime(message.countdown || 5);
        
        // Clear chart data for new game
        setChartData([]);
        setActiveTradesMap({});
        
        // Reset absolute candle index counter for new game
        absoluteCandleIndexRef.current = 0;
        
        // Reset grid system
        resetGridSystem();
        
        // Reset view scale to initial state
        setVisibleMaxValue(2.0);
        setCurrentMultiplier(1.0);
        setDisplayMultiplier(1.0);
        
        // Reset animated price values
        setAnimatedPrice(null);
        setAnimatedHigh(null);
        setAnimatedLow(null);
        
        // Reset scaling state
        setIsScaling(false);
        setStableGridLines([]);
      } 
      else if (message.state === 'active') {
        console.log('Game now active');
        setGameState('active');
      } 
      else if (message.state === 'rugged') {
        console.log('Game rugged!');
        rugGame();
      }
    }
  };
  
  // Test function to simulate websocket messages
  const testGameFlow = () => {
    console.log('Starting test game flow');
    
    // Clear any existing state
    stopTestSimulation();
    setIsTestRunning(true);
    
    // Start with presale state - shorter countdown (3 seconds)
    handleWebSocketMessage({
      type: 'gameState',
      state: 'presale',
      countdown: 3
    });
    
    // Simulate countdown (handled by the countdown useEffect)
    
    // After 4 seconds (reduced from 6), change to active state
    setTimeout(() => {
      handleWebSocketMessage({
        type: 'gameState',
        state: 'active'
      });
      
      // Simulate price updates
      let currentPrice = 1.0;
      const priceInterval = setInterval(() => {
        // Generate some random price movement
        const change = (Math.random() - 0.4) * 0.1; // Slight upward bias
        currentPrice = Math.max(0.1, currentPrice + change);
        
        handleWebSocketMessage({
          type: 'price',
          price: currentPrice
        });
      }, 250);
      
      // After 6 seconds (total of 10 seconds), rug the game
      setTimeout(() => {
        clearInterval(priceInterval);
        
        handleWebSocketMessage({
          type: 'gameState',
          state: 'rugged'
        });
        
        // After 8 seconds (faster restart), start a new presale round
        setTimeout(() => {
          handleWebSocketMessage({
            type: 'gameState',
            state: 'presale',
            countdown: 3
          });
        }, 8000);
        
      }, 6000); // Reduced from 8000 to 6000
      
    }, 4000); // Reduced from 6000 to 4000
  };
  
  // Update the visible range when the multiplier changes significantly
  useEffect(() => {
    previousMultiplierRef.current = currentMultiplier;

    if (gameState === 'presale') {
      setVisibleMaxValue(2.0);
      setDisplayMultiplier(1.0);
      return;
    }

    if (gameState === 'rugged') {
      const highestValue = displayedChartData.reduce((max, candle) => Math.max(max, candle.high), 2.0);
      setVisibleMaxValue(Math.max(highestValue * 1.1, 2.0));
      return;
    }

    const highestValueInChartData = chartData.reduce((max, candle) => Math.max(max, candle.high), currentMultiplier);
    const currentCandle = chartData[chartData.length - 1];
    const currentCandleRange = currentCandle ? (currentCandle.high - currentCandle.low) : 0;
    const currentCandleHigh = currentCandle ? currentCandle.high : currentMultiplier;
    
    // More dynamic viewport scaling
    const MIN_TOP_MARGIN_PERCENTAGE = 0.15;
    const MAX_TOP_MARGIN_PERCENTAGE = 0.4; // Increased from previous value
    const MIN_BOTTOM_MARGIN_PERCENTAGE = 0.1;
    
    // Calculate ideal max value with more dynamic margins
    const idealMaxValue = Math.max(
      highestValueInChartData * 1.4,
      currentMultiplier * 1.3,
      currentCandleHigh / (1 - MIN_TOP_MARGIN_PERCENTAGE),
      2.0
    );
    
    // Simplified scaling logic with more dynamic range
    const MINIMUM_RANGE = 1.2; // Reduced minimum range for more flexibility
    const ABSOLUTE_MIN_VISIBLE = 1.5; // Reduced minimum visible value
    
    // Cancel any ongoing animation and grid update timeout
    if (scalingAnimationRef.current) {
      cancelAnimationFrame(scalingAnimationRef.current);
      scalingAnimationRef.current = null;
    }
    if (gridUpdateTimeoutRef.current) {
      clearTimeout(gridUpdateTimeoutRef.current);
      gridUpdateTimeoutRef.current = null;
    }
    
    // Animate both scaling up and down for smoother transitions
    if (Math.abs(idealMaxValue - visibleMaxValue) > 0.05) {
      // Store current grid lines as stable during scaling
      setStableGridLines(generateGridLines(visibleMaxValue));
      setIsScaling(true);
      
      const startValue = visibleMaxValue;
      
      // More dynamic scaling logic
      let finalEndValue = idealMaxValue;
      
      // Allow more aggressive downscaling when price drops
      if (finalEndValue < visibleMaxValue * 0.4 && visibleMaxValue > ABSOLUTE_MIN_VISIBLE) {
        finalEndValue = Math.max(finalEndValue, visibleMaxValue * 0.5);
      }
      
      // Allow more aggressive upscaling when price rises
      if (finalEndValue > visibleMaxValue * 2.5) {
        finalEndValue = Math.min(finalEndValue, visibleMaxValue * 2.0);
      }
      
      // Only enforce minimum range if we're getting dangerously small
      const range = finalEndValue - MIN_VALUE;
      if (range < MINIMUM_RANGE) {
        finalEndValue = MIN_VALUE + MINIMUM_RANGE;
      }
      
      // Absolute minimum only for edge cases
      if (finalEndValue < ABSOLUTE_MIN_VISIBLE) {
        finalEndValue = Math.max(finalEndValue, ABSOLUTE_MIN_VISIBLE);
      }
      
      const startTime = performance.now();
      const duration = 400; // Faster animation
      
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Use smooth ease-out for all scaling
        const easedProgress = 1 - Math.pow(1 - progress, 2);
        
        const newValue = startValue + (finalEndValue - startValue) * easedProgress;
        
        // Single simple validation during animation
        const animationRange = newValue - MIN_VALUE;
        const safeNewValue = animationRange < MINIMUM_RANGE ? MIN_VALUE + MINIMUM_RANGE : newValue;
        
        setVisibleMaxValue(Math.max(safeNewValue, ABSOLUTE_MIN_VISIBLE));
        
        if (progress < 1) {
          scalingAnimationRef.current = requestAnimationFrame(animate);
        } else {
          scalingAnimationRef.current = null;
          
          // Update grid lines after scaling animation completes
          gridUpdateTimeoutRef.current = setTimeout(() => {
            setIsScaling(false);
            // Grid lines will update on next render cycle
          }, 50); // Increased from 30ms to 50ms for smoother grid line transitions
        }
      };
      scalingAnimationRef.current = requestAnimationFrame(animate);
    }
  }, [currentMultiplier, chartData, gameState, displayedChartData]);

  // Update the active candle animation to only handle the "bounce" effect
  useEffect(() => {
    // Only run in active state
    if (gameState !== 'active' || chartData.length === 0) {
      if (priceAnimationRef.current) {
        cancelAnimationFrame(priceAnimationRef.current);
        priceAnimationRef.current = null;
      }
      return;
    }
    
    // Get the latest price
    const latestCandle = chartData[chartData.length - 1];
    const actualPrice = latestCandle.close;
    const actualHigh = latestCandle.high;
    const actualLow = latestCandle.low;
    
    // Store actual price in ref for animation access
    actualPriceRef.current = {
      close: actualPrice,
      high: actualHigh,
      low: actualLow
    };
    
    // Check if we're working with a new candle and reset animated high/low appropriately
    const currentCandle = chartData[chartData.length - 1];
    if (currentCandle && currentCandleOpenRef.current !== currentCandle.open) {
      // We're working with a new candle - reset animated high/low to the candle's open price
      currentCandleOpenRef.current = currentCandle.open;
      setAnimatedHigh(currentCandle.open);
      setAnimatedLow(currentCandle.open);
    }
    
    // Initialize animated values if needed
    if (animatedPrice === null || animatedHigh === null || animatedLow === null) {
      setAnimatedPrice(actualPrice);
      // For proper candlestick behavior, high and low should start at current price
      setAnimatedHigh(actualPrice);
      setAnimatedLow(actualPrice);
      return;
    }
    
    // Skip animation if the close price difference is negligible
    // Note: We don't check high/low since they only extend based on current price
    if (Math.abs(animatedPrice - actualPrice) < 0.0001) {
      return;
    }
    
    // Clean up existing animation
    if (priceAnimationRef.current) {
      cancelAnimationFrame(priceAnimationRef.current);
      priceAnimationRef.current = null;
    }
    
    // Easing function for smoother animation
    const easeOutExpo = (t) => {
      return t === 1 ? 1 : 1 - Math.pow(2, -15 * t); // Increased from -10 to -15 for steeper curve
    };
    
    // Animation function - smooth transition between values
    const animate = () => {
      // Update close price with easing
      setAnimatedPrice(prev => {
        if (prev === null || !actualPriceRef.current) return prev;
        
        const diff = actualPriceRef.current.close - prev;
        // Increased animation speed (0.15 = snappier but still smooth)
        const step = diff * 0.15;
        const easedStep = step * easeOutExpo(Math.abs(step) / Math.abs(diff));
        
        // If we're close enough, snap to the actual value
        if (Math.abs(diff) < 0.0001) {
          return actualPriceRef.current.close;
        }
        
        return prev + easedStep;
      });
      
      // Update high price with easing - only extend upward, never retract
      setAnimatedHigh(prev => {
        if (prev === null || !actualPriceRef.current) return prev;
        
        // Only animate if the current price is higher than our animated high
        if (actualPriceRef.current.close > prev) {
          const diff = actualPriceRef.current.close - prev;
          const step = diff * 0.15;
          const easedStep = step * easeOutExpo(Math.abs(step) / Math.abs(diff));
          
          return prev + easedStep;
        }
        
        // If current price is not higher, keep the existing high
        return prev;
      });
      
      // Update low price with easing - only extend downward, never retract
      setAnimatedLow(prev => {
        if (prev === null || !actualPriceRef.current) return prev;
        
        // Only animate if the current price is lower than our animated low
        if (actualPriceRef.current.close < prev) {
          const diff = actualPriceRef.current.close - prev;
          const step = diff * 0.15;
          const easedStep = step * easeOutExpo(Math.abs(step) / Math.abs(diff));
          
          return prev + easedStep;
        }
        
        // If current price is not lower, keep the existing low
        return prev;
      });
      
      // Continue animation unless close price is close enough
      // Note: We don't check high/low convergence since they only extend, never retract
      if (Math.abs(animatedPrice - actualPriceRef.current.close) < 0.0001) {
        priceAnimationRef.current = null;
      } else {
        priceAnimationRef.current = requestAnimationFrame(animate);
      }
    };
    
    // Start animation
    priceAnimationRef.current = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      if (priceAnimationRef.current) {
        cancelAnimationFrame(priceAnimationRef.current);
        priceAnimationRef.current = null;
      }
    };
  }, [
    chartData.length > 0 ? chartData[chartData.length - 1].close : null,
    chartData.length > 0 ? chartData[chartData.length - 1].high : null, 
    chartData.length > 0 ? chartData[chartData.length - 1].low : null,
    animatedPrice, animatedHigh, animatedLow, gameState
  ]);

  // Animate multiplier value with easing
  useEffect(() => {
    // Don't skip animation for rugged state - we need to animate down to 0
    if (gameState === 'presale') {
      setDisplayMultiplier(1.0); // Ensure display is at 1.0 in presale
      return;
    }
    
    if (displayMultiplier === currentMultiplier) return;
    
    // Clean up any existing animation frame first
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Easing function for multiplier animation
    const easeOutExpo = (t) => {
      return t === 1 ? 1 : 1 - Math.pow(2, -15 * t); // Increased from -10 to -15 for steeper curve
    };
    
    const animateValue = () => {
      // If game is rugged but display hasn't reached 0 yet, force faster animation to 0
      if (gameState === 'rugged' && displayMultiplier > 0.05) {
        // Use a larger step for faster drop to 0
        const step = displayMultiplier * 0.2; // Reduced from 0.3 to 0.2 for smoother drop
        const easedStep = step * easeOutExpo(step / displayMultiplier);
        const newValue = displayMultiplier - easedStep;
        
        if (newValue <= 0.05) {
          setDisplayMultiplier(0);
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
          return;
        }
        
        setDisplayMultiplier(newValue);
        animationFrameRef.current = requestAnimationFrame(animateValue);
        return;
      }
      else if (gameState === 'rugged') {
        // Final snap to exactly 0
        setDisplayMultiplier(0);
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
        return;
      }
      
      // Regular animation for non-rugged state
      // Calculate step size based on difference
      const diff = currentMultiplier - displayMultiplier;
      // Increased animation speed (0.25 = snappier but still smooth)
      const step = diff * 0.25;
      const easedStep = step * easeOutExpo(Math.abs(step) / Math.abs(diff));
      
      if (Math.abs(diff) < 0.0001) {
        setDisplayMultiplier(currentMultiplier);
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
        return;
      }
      
      const newValue = displayMultiplier + easedStep;
      setDisplayMultiplier(newValue);
      
      animationFrameRef.current = requestAnimationFrame(animateValue);
    };
    
    animationFrameRef.current = requestAnimationFrame(animateValue);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (gridUpdateTimeoutRef.current) {
        clearTimeout(gridUpdateTimeoutRef.current);
        gridUpdateTimeoutRef.current = null;
      }
    };
  }, [currentMultiplier, displayMultiplier, gameState]);

  // Additional effect to immediately respond to multiplier changes during active game
  useEffect(() => {
    if (gameState === 'active' && currentMultiplier !== 1.0) {
      // Immediately update player data when multiplier changes during active game
      const updatedData = generateFakeLeaderboardData(currentMultiplier, true);
      setPlayersData(updatedData);
    }
  }, [currentMultiplier, gameState]);

  // Add state for grid line fade-in
  const [gridLinesVisible, setGridLinesVisible] = useState(false);

  // Fade in grid lines after mount or when gridLineMultipliers change
  useEffect(() => {
    setGridLinesVisible(false);
    const timeout = setTimeout(() => setGridLinesVisible(true), 50); // Increased from 30ms to 50ms for smoother transitions
    return () => clearTimeout(timeout);
  }, [gridLineMultipliers.length, visibleMaxValue]);

  // Function to update player percentages during active game
  const updatePlayerPercentages = useCallback(() => {
    if (gameState !== 'active') return;
    
    setPlayersData(prevPlayers => {
      return prevPlayers.map(player => ({
        ...player,
        currentPercent: generateFluctuatingPercent(player.currentPercent, currentMultiplier)
      })).sort((a, b) => b.currentPercent - a.currentPercent); // Sort by percentage descending
    });
  }, [gameState, currentMultiplier]);

  // Function to reset player data for presale
  const resetPlayerData = useCallback(() => {
    setPlayersData(prevPlayers => {
      return prevPlayers.map(player => ({
        ...player,
        currentPercent: 0
      }));
    });
  }, []);
  
  // Handle player percentage updates during active game
  useEffect(() => {
    let playerUpdateInterval = null;
    
    if (gameState === 'active') {
      // IMMEDIATELY update player data when game becomes active
      const immediateData = generateFakeLeaderboardData(currentMultiplier, true);
      setPlayersData(immediateData);
      
      // Then start the interval for continuous updates with rolling values
      playerUpdateInterval = setInterval(() => {
        // Generate new target values but keep players in same positions
        const newTargetData = generateFakeLeaderboardData(currentMultiplier, true);
        
        // Update players with new target values while maintaining order
        setPlayersData(prev => prev.map((player, index) => {
          const targetPlayer = newTargetData[index]; // Keep same position
          return {
            ...player,
            targetPercent: targetPlayer.currentPercent,
            targetValue: targetPlayer.currentValue,
            targetProfit: targetPlayer.profit,
            targetFormattedPercent: targetPlayer.percent
          };
        }));
      }, 500); // Reduced frequency for smoother rolling
    } else if (gameState === 'presale') {
      // Reset player data when entering presale
      const resetData = generateFakeLeaderboardData(1.0, false);
      setPlayersData(resetData);
    } else if (gameState === 'rugged') {
      // Set all players to large negative percentages (they lost everything)
      setPlayersData(prevPlayers => {
        return prevPlayers.map(player => {
          const ruggedPercent = -80 - Math.random() * 20; // Between -80% and -100%
          const currentValue = player.baseAmount * (1 + ruggedPercent / 100);
          const ruggedProfit = currentValue - player.baseAmount;
          const formattedProfit = `${ruggedProfit.toFixed(3)}`;
          const formattedPercent = formatPercentage(ruggedPercent);
          
          return {
            ...player,
            currentPercent: ruggedPercent,
            currentValue: currentValue,
            profit: formattedProfit,
            percent: formattedPercent
          };
        }); // No sorting - keep players in same positions
      });
    }
    
    return () => {
      if (playerUpdateInterval) {
        clearInterval(playerUpdateInterval);
      }
    };
  }, [gameState, currentMultiplier]);

  // Rolling animation effect for player values (like the multiplier animation)
  useEffect(() => {
    if (gameState !== 'active') return;
    
    playersData.forEach((player, index) => {
      const playerId = `${player.address}-${index}`;
      
      // Clean up existing animation
      if (playerAnimationRefs.current[playerId]) {
        cancelAnimationFrame(playerAnimationRefs.current[playerId]);
      }
      
      // Get current animated values or initialize them
      const currentAnimated = animatedPlayerValues[playerId] || {
        percent: player.currentPercent,
        profit: parseFloat(player.profit?.replace('+', '') || '0')
      };
      
      // Target values from the player data
      const targetPercent = player.currentPercent;
      const targetProfit = parseFloat(player.profit?.replace('+', '') || '0');
      
      // Skip animation if values are very close
      if (Math.abs(currentAnimated.percent - targetPercent) < 0.001 && 
          Math.abs(currentAnimated.profit - targetProfit) < 0.001) {
        return;
      }
      
      // Easing function for smooth animation
      const easeOutExpo = (t) => {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      };
      
      // Animation function
      const animate = () => {
        setAnimatedPlayerValues(prev => {
          const current = prev[playerId] || currentAnimated;
          
          // Calculate steps with easing
          const percentDiff = targetPercent - current.percent;
          const profitDiff = targetProfit - current.profit;
          
          const step = 0.15; // Animation speed
          const percentStep = percentDiff * step;
          const profitStep = profitDiff * step;
          
          const easedPercentStep = percentStep * easeOutExpo(Math.abs(percentStep) / Math.abs(percentDiff || 1));
          const easedProfitStep = profitStep * easeOutExpo(Math.abs(profitStep) / Math.abs(profitDiff || 1));
          
          // Check if we're close enough to snap to target
          if (Math.abs(percentDiff) < 0.001 && Math.abs(profitDiff) < 0.001) {
            playerAnimationRefs.current[playerId] = null;
            return {
              ...prev,
              [playerId]: {
                percent: targetPercent,
                profit: targetProfit
              }
            };
          }
          
          // Continue animation
          const newValues = {
            percent: current.percent + easedPercentStep,
            profit: current.profit + easedProfitStep
          };
          
          playerAnimationRefs.current[playerId] = requestAnimationFrame(animate);
          
          return {
            ...prev,
            [playerId]: newValues
          };
        });
      };
      
      // Start animation
      playerAnimationRefs.current[playerId] = requestAnimationFrame(animate);
    });
    
    // Cleanup function
    return () => {
      Object.values(playerAnimationRefs.current).forEach(animationId => {
        if (animationId) cancelAnimationFrame(animationId);
      });
    };
  }, [playersData, gameState]);

  // Helper function to generate fake dynamic leaderboard data for demo
  const generateFakeLeaderboardData = (chartMultiplier, isActive = false) => {
    if (!isActive) {
      // During presale or inactive, show all zeros but keep base amounts
      return playersData.map(player => ({
        ...player,
        currentPercent: 0,
        currentValue: player.baseAmount, // Show starting value
        profit: "0.000",
        percent: "0.0%"
      }));
    }
    
    // Calculate the percentage change from the 1.0x baseline
    const percentageChange = (chartMultiplier - 1.0) * 100;
    
    console.log('DEBUG - Chart Multiplier:', chartMultiplier, 'Percentage Change:', percentageChange);
    
    const updatedPlayers = playersData.map((player, index) => {
      // Each player's percentage should be based on chart movement with small individual variation
      // Add small individual variation based on player index for consistent "personality"
      const playerSeed = (index + 1) * 0.1; // Each player gets a unique seed
      
      // Reduce variation significantly to minimize flashing
      const timeVariation = Math.sin(Date.now() * 0.001 + playerSeed) * 0.8; // Reduced from ±2% to ±0.8% and slower time
      const randomVariation = (Math.random() - 0.5) * 0.5; // Small random variation for realism
      const baseVariation = timeVariation + randomVariation;
      const playerPercent = percentageChange + baseVariation;
      
      // Calculate current value: baseAmount * (1 + percentageChange/100)
      const currentValue = player.baseAmount * (1 + playerPercent / 100);
      
      // Calculate profit amount (difference from base amount)
      const profitAmount = currentValue - player.baseAmount;
      const formattedProfit = profitAmount === 0 ? "0.000" : (profitAmount > 0 ? `+${profitAmount.toFixed(3)}` : `${profitAmount.toFixed(3)}`);
      const formattedPercent = formatPercentage(playerPercent);
      
      return {
        ...player,
        currentPercent: playerPercent,
        currentValue: currentValue,
        profit: formattedProfit,
        percent: formattedPercent
      };
    });
    
    // Always maintain the same order - no sorting
    return updatedPlayers;
  };

  return (
    <div className="app-container">
      <Logo />
      <TestControls 
        onStartTest={startTestSimulation} 
        isRunning={isTestRunning} 
        onStopTest={stopTestSimulation}
        onTestGameStates={testGameFlow}
      />
      <div className="game-graph-container" style={{ height: containerHeight }}>
        <div className="game-content">
          {/* Unified container for both chart and leaderboard */}
          <div className="unified-container">
            {/* Background grid lines that span the unified container but stop at leaderboard edge */}
            <div className="grid-background">
              <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, zIndex: 0, pointerEvents: 'none' }}>
                <TransitionGroup component={null}>
                  {gridLineMultipliers.map((y, i) => (
                    <CSSTransition
                      key={y}
                      timeout={600}
                      classNames="grid-fade"
                      appear
                    >
                      <g className="grid-fade-line">
                        <line
                          x1={0}
                          x2="100%"
                          y1={norm(y)}
                          y2={norm(y)}
                          stroke={gridLineColors[i % gridLineColors.length]}
                          strokeWidth={0.5}
                          opacity={0.5}
                          className="grid-fade-line"
                        />
                        <text
                          x={10}
                          y={norm(y) - 8}
                          fill="#FFFFFF"
                          fontSize={14}
                          fontWeight="600"
                          className="grid-fade-line grid-line-label"
                        >
                          {y.toFixed(1)}x
                        </text>
                      </g>
                    </CSSTransition>
                  ))}
                </TransitionGroup>
                <line
                  x1="0"
                  x2="100%"
                  y1={norm(gameState === 'active' && animatedPrice !== null ? animatedPrice : displayMultiplier)}
                  y2={norm(gameState === 'active' && animatedPrice !== null ? animatedPrice : displayMultiplier)}
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  strokeDasharray="4,4"
                  className="current-price-indicator"
                  style={{
                    filter: "drop-shadow(0 0 4px rgba(255, 255, 255, 0.8))",
                    animation: "dash 0.5s linear infinite"
                  }}
                />
                {isTestRunning && (
                  <line
                    x1="0"
                    x2="100%"
                    y1={norm(1.0)}
                    y2={norm(1.0)}
                    stroke="url(#multiplier-line-gradient)"
                    strokeWidth={1.5}
                    strokeDasharray="none"
                  />
                )}
              </svg>
            </div>
            
            
            {/* Chart area with candles */}
            <div className={`chart-container ${gameState === 'rugged' ? 'rugged' : ''}`}
                 ref={chartContainerRef}
                 style={{ overflow: 'visible', position: 'relative' }}>
              <div className="chart-area" style={{ overflow: 'visible' }}>
                {/* Move the grid lines and labels inside this SVG to ensure proper layering */}
                <svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style={{ overflow: 'visible' }}>
                  <defs>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                    
                    {/* 3D Cartoon-style gradients */}
                    <linearGradient id="red-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff2222" />
                      <stop offset="25%" stopColor="#ff0000" />
                      <stop offset="50%" stopColor="#ee0000" />
                      <stop offset="75%" stopColor="#dd0000" />
                      <stop offset="100%" stopColor="#cc0000" />
                    </linearGradient>
                    
                    <linearGradient id="blue-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22ff22" />
                      <stop offset="25%" stopColor="#00ff00" />
                      <stop offset="50%" stopColor="#00ee00" />
                      <stop offset="75%" stopColor="#00dd00" />
                      <stop offset="100%" stopColor="#00cc00" />
                    </linearGradient>
                    
                    {/* Special rugged gradient with fire effect */}
                    <linearGradient id="rugged-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff8844" />
                      <stop offset="30%" stopColor="#ff4422" />
                      <stop offset="50%" stopColor="#ff0000" />
                      <stop offset="70%" stopColor="#ee0000" />
                      <stop offset="100%" stopColor="#cc0000" />
                    </linearGradient>
                    
                    {/* Highlight gradients for 3D effect */}
                    <linearGradient id="candle-highlight" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                      <stop offset="30%" stopColor="rgba(255,255,255,0.6)" />
                      <stop offset="70%" stopColor="rgba(255,255,255,0.2)" />
                      <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
                    </linearGradient>
                    
                    {/* Shadow filter for 3D depth */}
                    <filter id="candle-3d" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                      <feOffset dx="2" dy="3" result="offset"/>
                      <feFlood floodColor="rgba(0,0,0,0.4)"/>
                      <feComposite in2="offset" operator="in"/>
                      <feMerge>
                        <feMergeNode/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                    
                    {/* Bright glow for mobile game feel */}
                    <filter id="mobile-glow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                    
                    {/* Gradients for trade notification borders */}
                    <linearGradient id="buy-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#00A63E" stopOpacity="0" />
                      <stop offset="70%" stopColor="#00A63E" stopOpacity="1" />
                      <stop offset="100%" stopColor="#00A63E" stopOpacity="1" />
                    </linearGradient>
                    <linearGradient id="sell-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#E7000B" stopOpacity="0" />
                      <stop offset="70%" stopColor="#E7000B" stopOpacity="1" />
                      <stop offset="100%" stopColor="#E7000B" stopOpacity="1" />
                    </linearGradient>
                    
                    <linearGradient id="multiplier-line-gradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#000000" />
                      <stop offset="50%" stopColor="#263BF0" />
                      <stop offset="100%" stopColor="#F01100" />
                    </linearGradient>
                    <linearGradient id="leaderboard-fade-top" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#000" stopOpacity="1" />
                      <stop offset="15%" stopColor="#000" stopOpacity="0" />
                      <stop offset="100%" stopColor="#000" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="leaderboard-fade-bottom" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#000" stopOpacity="0" />
                      <stop offset="60%" stopColor="#000" stopOpacity="0.85" />
                      <stop offset="85%" stopColor="#000" stopOpacity="0.98" />
                      <stop offset="100%" stopColor="#000" stopOpacity="1" />
                    </linearGradient>
                    {/* Rainbow gradient for price indicator */}
                    <linearGradient id="rainbow-gradient" x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#F01100">
                        <animate attributeName="offset" values="0;0.25;0.5;0.75;1;0" dur="8s" repeatCount="indefinite" />
                      </stop>
                      <stop offset="25%" stopColor="#FF4D9D">
                        <animate attributeName="offset" values="0.25;0.5;0.75;1;0.25;0.25" dur="8s" repeatCount="indefinite" />
                      </stop>
                      <stop offset="50%" stopColor="#FFDC40">
                        <animate attributeName="offset" values="0.5;0.75;1;0.25;0.5;0.5" dur="8s" repeatCount="indefinite" />
                      </stop>
                      <stop offset="75%" stopColor="#263BF0">
                        <animate attributeName="offset" values="0.75;1;0.25;0.5;0.75;0.75" dur="8s" repeatCount="indefinite" />
                      </stop>
                      <stop offset="100%" stopColor="#F01100">
                        <animate attributeName="offset" values="1;0.25;0.5;0.75;1;1" dur="8s" repeatCount="indefinite" />
                      </stop>
                    </linearGradient>

                    {/* Add animated dotted line definition */}
                    <defs>
                      <pattern id="dotted-pattern" x="0" y="0" width="20" height="1" patternUnits="userSpaceOnUse">
                        <line x1="0" y1="0" x2="10" y2="0" stroke="url(#rainbow-gradient)" strokeWidth="2" />
                      </pattern>
                    </defs>
                    
                    {/* Explosion gradients for rug candle */}
                    <radialGradient id="explosion-gradient" cx="0.5" cy="0.5" r="0.5" fx="0.5" fy="0.5">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="20%" stopColor="#ff0000" />
                      <stop offset="80%" stopColor="#cc0000" />
                      <stop offset="100%" stopColor="#660000" stopOpacity="0" />
                      <animate attributeName="r" values="0.4;0.5;0.45;0.5;0.4" dur="1s" repeatCount="indefinite" />
                    </radialGradient>
                    
                    <radialGradient id="fire-gradient" cx="0.5" cy="0.3" r="0.7" fx="0.5" fy="0.3">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="10%" stopColor="#ffaa00" />
                      <stop offset="30%" stopColor="#ff6600" />
                      <stop offset="70%" stopColor="#ff0000" />
                      <stop offset="100%" stopColor="#990000" stopOpacity="0.6" />
                    </radialGradient>
                    
                    <filter id="explosion-filter" x="-100%" y="-100%" width="300%" height="300%">
                      <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                      <feColorMatrix in="blur" mode="matrix" values="
                        1 0 0 0 0
                        0 0.5 0 0 0
                        0 0 0.1 0 0
                        0 0 0 1 0" result="red-blur" />
                      <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="5" result="noise" />
                      <feDisplacementMap in="red-blur" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" result="displaced" />
                      <feComposite in="displaced" in2="SourceGraphic" operator="out" />
                    </filter>

                  </defs>
                  
                  {/* First draw the grid lines */}
                  <TransitionGroup component={null}>
                    {gridLineMultipliers.map((y, i) => (
                      <CSSTransition
                        key={y}
                        timeout={600}
                        classNames="grid-fade"
                        appear
                      >
                        <g className="grid-fade-line">
                          <line
                            x1={0}
                            x2="120%"
                            y1={norm(y)}
                            y2={norm(y)}
                            stroke={gridLineColors[i % gridLineColors.length]}
                            strokeWidth={0.5}
                            opacity={0.5}
                            className="grid-fade-line"
                          />
                        </g>
                      </CSSTransition>
                    ))}
                  </TransitionGroup>
                  
                  {/* Then draw the candles */}
                  {displayedChartData.length > 0 && (isTestRunning || isRugged) && (
                    <g>
                      {displayedChartData.map((candle, i) => {
                        const isLatestCandle = i === displayedChartData.length - 1;
                        const prev = i > 0 ? displayedChartData[i - 1] : candle;
                        const up = candle.close >= candle.open;
                        const isRugCandle = candle.isRugCandle || (gameState === 'rugged' && isLatestCandle);
                        
                        // For rug candles, always use red gradient regardless of open/close values
                        const gradientId = isRugCandle ? "red-gradient" : (up ? "blue-gradient" : "red-gradient");
                        
                        // Calculate responsive values based on window width
                        const isMobile = windowWidth <= 640;
                        const isSmall = windowWidth <= 900 && windowWidth > 640;
                        
                        // Get container dimensions
                        const containerWidth = chartContainerRef.current 
                          ? chartContainerRef.current.clientWidth 
                          : CHART_WIDTH;
                        
                        // Reserve space for leaderboard based on container size
                        // Be extremely aggressive with the right margin to ensure candles are never cut off
                        const leaderboardWidth = isMobile ? 160 : (isSmall ? 240 : 320);
                        const rightMargin = containerWidth * 0.25 + leaderboardWidth * 0.1;
                        
                        // Calculate candle dimensions
                        const maxVisibleCandles = 15;
                        const candleWidthRatio = windowWidth <= 640 ? 0.6 : 1;
                        const responsiveCandleWidth = Math.max(
                          4, 
                          Math.min(CANDLE_WIDTH * candleWidthRatio, ((containerWidth - rightMargin) / maxVisibleCandles) * 0.8)
                        );
                        
                        // Calculate gap between candles
                        const gap = Math.max(4, Math.min(CANDLE_GAP, containerWidth / 200)); // Adjusted divisor from 320 to 200 for more consistent gaps
                        
                        // Position the latest candle with a fixed offset from the right edge
                        const distanceFromEnd = displayedChartData.length - 1 - i;
                        
                        const availableWidth = containerWidth - rightMargin;
                        
                        // Calculate candle positions from right to left
                        // Latest candle is positioned with safe margin from the right edge
                        const SAFE_MARGIN = containerWidth * 0.09;  // Further reduced margin to position candle closer to leaderboard
                        const latestCandleX = availableWidth - SAFE_MARGIN;
                        const x = latestCandleX - (distanceFromEnd * (responsiveCandleWidth + gap));
                        
                        // Calculate candle body dimensions - using animated price for the active candle
                        let candleClose = candle.close;
                        let candleHigh = candle.high;
                        let candleLow = candle.low;
                        
                        // For the latest candle, we want to ensure smooth transitions
                        if (isLatestCandle && gameState === 'active') {
                          if (animatedPrice !== null) {
                            candleClose = animatedPrice;
                            // Use animated high/low values for smooth wick growth
                            if (animatedHigh !== null) {
                              candleHigh = animatedHigh;
                            }
                            if (animatedLow !== null) {
                              candleLow = animatedLow;
                            }
                          }
                        }
                        
                        const bodyTop = norm(Math.max(candle.open, candleClose));
                        const bodyBottom = norm(Math.min(candle.open, candleClose));
                        const bodyHeight = Math.max(bodyBottom - bodyTop, 2); // Ensure minimum height
                        
                        // Calculate wick dimensions - using the updated high/low values
                        const wickTop = norm(candleHigh);
                        const wickBottom = norm(candleLow);
                        
                        // Only render candles that are in the visible area
                        // Allow candles to run off left side but ensure visible on right
                        if (x > containerWidth) return null;
                        
                        // Hide candles in presale mode
                        if (gameState === 'presale') return null;
                        
                        return (
                          <g
                            key={`candle-${i}`}
                            className={isRugCandle ? 'rugged-candle' : ''}
                          >
                            {/* Wick */}
                            <line
                              x1={x + responsiveCandleWidth / 2}
                              y1={wickTop}
                              x2={x + responsiveCandleWidth / 2}
                              y2={wickBottom}
                              stroke={isRugCandle ? "#ff0000" : (up ? "#00ff00" : "#ff0000")}
                              strokeWidth={isRugCandle ? (isMobile ? 4 : 5) : (isMobile ? 2 : 3)}
                              strokeLinecap="round"
                              style={{
                                filter: isRugCandle 
                                  ? "drop-shadow(0 0 4px #ff0000)"
                                  : "drop-shadow(0 0 2px rgba(0,0,0,0.3))"
                              }}
                            />
                            
                            {/* Candle body with 3D cartoon styling */}
                            <g>
                              {/* Main candle body with rounded corners */}
                              <rect
                                x={x}
                                y={bodyTop}
                                width={responsiveCandleWidth}
                                height={bodyHeight}
                                rx={responsiveCandleWidth * 0.15} // Rounded corners
                                ry={responsiveCandleWidth * 0.15}
                                fill={`url(#${isRugCandle ? "rugged-gradient" : (up ? "blue-gradient" : "red-gradient")})`}
                                stroke={isRugCandle ? "#ff0000" : (up ? "#00ff00" : "#ff0000")}
                                strokeWidth={isMobile ? 1.5 : 2}
                                style={{
                                  filter: isRugCandle 
                                    ? "url(#mobile-glow) drop-shadow(0 0 8px #ff0000) drop-shadow(0 0 12px #ff0000)"
                                    : "url(#candle-3d)"
                                }}
                              />
                            </g>
                            
                            {/* Removed explosion effect for cleaner rug candle */}
                          </g>
                        );
                      })}
                    </g>
                  )}
                  
                  {/* Add fade overlay on top of candles for clean fade effect */}
                  {displayedChartData.length > 0 && (isTestRunning || isRugged) && (
                    <defs>
                      <linearGradient id="candle-fade-overlay" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#000000" stopOpacity="1" />
                        <stop offset={windowWidth <= 640 ? "12%" : "8%"} stopColor="#000000" stopOpacity="0.8" />
                        <stop offset={windowWidth <= 640 ? "18%" : "12%"} stopColor="#000000" stopOpacity="0" />
                        <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  )}
                  
                  {/* Fade overlay rectangle */}
                  {displayedChartData.length > 0 && (isTestRunning || isRugged) && (
                    <rect
                      x="0"
                      y="0"
                      width="100%"
                      height="100%"
                      fill="url(#candle-fade-overlay)"
                      pointerEvents="none"
                      style={{ mixBlendMode: 'normal' }}
                    />
                  )}
                  
                  {/* Draw the indicator lines on top of candles */}
                  {displayedChartData.length > 0 && isTestRunning && gameState !== 'presale' && (
                    <g>
                      <line
                        x1="0"
                        x2="120%" /* Extend beyond container width to flow behind leaderboard */
                        y1={norm(gameState === 'active' && animatedPrice !== null ? animatedPrice : displayMultiplier)}
                        y2={norm(gameState === 'active' && animatedPrice !== null ? animatedPrice : displayMultiplier)}
                        stroke="#FFFFFF"
                        strokeWidth={2}
                        strokeDasharray="4,4"
                        className="current-price-indicator"
                        style={{ 
                          filter: "drop-shadow(0 0 4px rgba(255, 255, 255, 0.8))",
                          animation: "dash 0.5s linear infinite"
                        }}
                      />
                      {/* Add the multiplier text directly in the SVG */}
                      <text
                        x="97%" // Move further right, away from candles
                        y={norm(gameState === 'active' && animatedPrice !== null ? animatedPrice : displayMultiplier) - 15}
                        fill="#FFFFFF"
                        fontSize={windowWidth <= 640 ? 18 : windowWidth <= 900 ? 22 : 28}
                        textAnchor="end"
                        dominantBaseline="middle"
                        style={{
                          filter: "drop-shadow(0 0 10px rgba(0,0,0,0.8)) drop-shadow(0 0 20px rgba(0,0,0,0.8))",
                          fontFamily: "Inter, Arial, sans-serif",
                          fontWeight: 700
                        }}
                      >
                        {(gameState === 'active' && animatedPrice !== null ? animatedPrice : displayMultiplier).toFixed(4)}X
                      </text>
                    </g>
                  )}
                  
                  {/* Multiplier gradient line - always at 1.0x as reference */}
                  {isTestRunning && (
                    <line
                      x1="0"
                      x2="120%" /* Extend beyond container width to flow behind leaderboard */
                      y1={norm(1.0)} /* Always keep the multiplier line at 1.0x */
                      y2={norm(1.0)}
                      stroke="url(#multiplier-line-gradient)"
                      strokeWidth={1.5}
                      strokeDasharray="none"
                    />
                  )}
                  
                  {/* Draw all active trade markers AFTER indicator lines, using a higher z-index group */}
                  <g style={{ isolation: "isolate" }}>
                    {isTestRunning && gameState === 'active' && Object.values(displayedTrades).map(trade => {
                      // First, find the corresponding candle in the current chart data
                      // Look for the candle with the matching absolute index
                      let targetCandle = null;
                      let targetCandlePosition = -1;
                      
                      for (let i = 0; i < displayedChartData.length; i++) {
                        if (displayedChartData[i].absoluteIndex === trade.absoluteCandleIndex) {
                          targetCandle = displayedChartData[i];
                          targetCandlePosition = i;
                          break;
                        }
                      }
                      
                      // If we can't find the candle in current view, don't render the marker
                      if (!targetCandle) return null;
                      
                      // Calculate responsive values based on window width
                      const isMobile = windowWidth <= 640;
                      const isSmall = windowWidth <= 900 && windowWidth > 640;
                      
                      const containerWidth = chartContainerRef.current 
                        ? chartContainerRef.current.clientWidth 
                        : CHART_WIDTH;
                      
                      const leaderboardWidth = isMobile ? 160 : (isSmall ? 240 : 320);
                      const rightMargin = containerWidth * 0.25 + leaderboardWidth * 0.1;
                      
                      const candleWidthRatio = windowWidth <= 640 ? 0.6 : 1;
                      const responsiveCandleWidth = Math.max(
                        4, 
                        Math.min(CANDLE_WIDTH * candleWidthRatio, ((containerWidth - rightMargin) / 15) * 0.8)
                      );
                      
                      const gap = Math.max(4, Math.min(CANDLE_GAP, containerWidth / 200)); // Adjusted divisor from 320 to 200 for more consistent gaps
                      
                      const availableWidth = containerWidth - rightMargin;
                      const SAFE_MARGIN = containerWidth * 0.09;
                      const latestCandleX = availableWidth - SAFE_MARGIN;
                      
                      // Calculate position of the target candle
                      const distanceFromLatest = displayedChartData.length - 1 - targetCandlePosition;
                      const targetCandleX = latestCandleX - (distanceFromLatest * (responsiveCandleWidth + gap));
                      
                      // Position marker to the left of the target candle
                      const x = targetCandleX - 100; // Place marker 100px to the left of the candle
                      
                      // Calculate y position based on the original price
                      const y = norm(trade.price);
                      
                      return (
                        <TradeMarker
                          key={trade.id}
                          trade={trade}
                          x={x}
                          y={y}
                          opacity={trade.opacity}
                          candleX={targetCandleX + responsiveCandleWidth/2} // Middle of candle X position
                        />
                      );
                    })}
                  </g>
                  
                  {/* Finally draw the grid labels on top */}
                  <TransitionGroup component={null}>
                    {gridLineMultipliers.map((y, i) => (
                      <CSSTransition
                        key={y}
                        timeout={600}
                        classNames="grid-fade"
                        appear
                      >
                        <g className="grid-fade-line">
                          <text
                            x={10}
                            y={norm(y) - 8}
                            fill="#FFFFFF"
                            fontSize={14}
                            fontWeight="600"
                            style={{
                              filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.8))'
                            }}
                            className="grid-fade-line grid-line-label"
                          >
                            {y.toFixed(1)}x
                          </text>
                        </g>
                      </CSSTransition>
                    ))}
                  </TransitionGroup>
                  
                  {/* Add 'RUGGED' text in the chart SVG when rugged */}
                  {gameState === 'rugged' && (
                    <></>
                  )}
                </svg>
                
                {/* Game state overlays */}
                {isTestRunning && gameState === 'presale' && (
                  <PresaleOverlay countdownTime={countdownTime} />
                )}
              </div>
            </div>
            
            {/* Player list with fade effects */}
            <div
              className="player-list-container"
              style={{
                position: 'relative',
                background: 'none',
                zIndex: 10,
                flexBasis: `${dynamicLeaderboardWidth}px`, // Use the new dynamic width
                flexShrink: 0
              }}
            >
              <div
                className="player-list"
                style={{
                  overflowY: 'auto',
                  height: '100%',
                  paddingRight: '4px', // Reduced from 8px to 4px for tighter spacing
                  boxSizing: 'border-box', // Ensure padding is accounted for correctly
                }}
              >
                {playersData.map((player, idx) => (
                  <PlayerBox key={`${player.address}-${player.name}`} player={player} index={idx} animatedValues={animatedPlayerValues} />
                ))}
              </div>
              {/* Fade overlay absolutely positioned at the bottom of the container */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: '80px', // Increased height for smoother fade
                  pointerEvents: 'none',
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 50%, #000 100%)',
                  zIndex: 2,
                }}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Add resize handle */}
      <div 
        className="resize-handle"
        onMouseDown={handleMouseDown}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '8px',
          cursor: 'ns-resize',
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(255,255,255,0.2))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}
      >
        <div style={{
          width: '40px',
          height: '4px',
          background: 'rgba(255,255,255,0.3)',
          borderRadius: '2px'
        }} />
      </div>
    </div>
  );
}

function PresaleOverlay({ countdownTime }) {
  // Format the countdown to always show one decimal place
  const formattedCountdown = typeof countdownTime === 'number' 
    ? countdownTime.toFixed(1) 
    : '0.0';
  
  // Responsive adjustments
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 600;
  const countdownBoxPadding = isMobile ? '6px 16px' : '10px 40px';
  const countdownFontSize = isMobile ? '28px' : '50px';
  const nextRoundFontSize = isMobile ? '12px' : '16px';
  const countdownBoxMarginLeft = isMobile ? '32px' : '0';
  const countdownBoxAlignSelf = isMobile ? 'flex-start' : 'center';
  
  return (
    <div className="game-overlay presale-overlay" style={{
      background: 'none',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 10
    }}>
      {/* PRESALE text and subtitle positioned at the top left */}
      <div style={{
        position: 'absolute',
        top: '15px',
        left: '50px',
        zIndex: 20
      }}>
        <div style={{
          fontFamily: 'Chewy, cursive',
          fontWeight: 'bold',
          fontSize: '22px',
          color: 'white',
          marginBottom: '2px'
        }}>
          PRESALE
        </div>
        <div style={{
          fontFamily: 'Inter, Arial, sans-serif',
          fontSize: '11px',
          color: 'white'
        }}>
          <div>Buy a guaranteed position at</div>
          <div><span style={{ color: '#2BFF64', fontWeight: 'bold' }}>1.00x</span> before the round starts</div>
        </div>
      </div>

      {/* Centered content with countdown */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1
      }}>
        {/* Countdown without corner design */}
        <div style={{
          position: 'relative',
          padding: countdownBoxPadding,
          marginLeft: countdownBoxMarginLeft,
          alignSelf: countdownBoxAlignSelf,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {/* Next round text inside the box */}
          <div style={{
            textAlign: 'center',
            marginBottom: '10px',
            color: 'white',
            fontFamily: 'monospace',
            fontSize: nextRoundFontSize,
            zIndex: 1
          }}>
            NEXT ROUND IN...
          </div>
          {/* Countdown number with decimal - using Chewy font */}
          <div style={{
            color: 'white',
            fontFamily: 'Chewy, cursive',
            fontSize: countdownFontSize,
            fontWeight: 'bold',
            zIndex: 1
          }}>
            {formattedCountdown}
          </div>
        </div>
      </div>
    </div>
  );
}

function CandleChart({ data, currentMultiplier, gridLineMultipliers, norm }) {
  return (
    <svg width={CHART_WIDTH} height={CHART_HEIGHT} className="chart-svg">
      <defs>
        <linearGradient id="red-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF3B3B" />
          <stop offset="100%" stopColor="#FF6EC7" />
        </linearGradient>
        <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#22ff22" />
          <stop offset="25%" stopColor="#00ff00" />
          <stop offset="50%" stopColor="#00ee00" />
          <stop offset="75%" stopColor="#00dd00" />
          <stop offset="100%" stopColor="#00cc00" />
        </linearGradient>
      </defs>
      
      {/* Grid lines */}
      {gridLineMultipliers.map((multiplier, i) => (
        <g key={`grid-${i}`}>
          <line
            x1="0"
            y1={norm(multiplier)}
            x2={CHART_WIDTH}
            y2={norm(multiplier)}
            stroke={gridLineColors[i % gridLineColors.length]}
            strokeWidth="1"
            strokeDasharray="5,5"
          />
          <text
            x="5"
            y={norm(multiplier) - 5}
            fill={gridLineColors[i % gridLineColors.length]}
            fontSize="12"
          >
            {multiplier.toFixed(1)}x
          </text>
        </g>
      ))}
      
      {/* Candles */}
      {data.map((candle, i) => {
        const x = i * (CANDLE_WIDTH + CANDLE_GAP);
        const up = candle.close >= candle.open;
        const gradientId = up ? "red-gradient" : "blue-gradient";
        
        // Calculate candle body dimensions
        const bodyTop = norm(Math.max(candle.open, candle.close));
        const bodyBottom = norm(Math.min(candle.open, candle.close));
        const bodyHeight = bodyBottom - bodyTop;
        
        // Calculate wick dimensions
        const wickTop = norm(candle.high);
        const wickBottom = norm(candle.low);
        
        return (
          <g key={`candle-${i}`}>
            {/* Wick */}
            <line
              x1={x + CANDLE_WIDTH / 2}
              y1={wickTop}
              x2={x + CANDLE_WIDTH / 2}
              y2={wickBottom}
              stroke={up ? "#FF3B3B" : "#3B6EFF"}
              strokeWidth="2"
            />
            
            {/* Candle body */}
            <rect
              x={x}
              y={bodyTop}
              width={CANDLE_WIDTH}
              height={bodyHeight}
              fill={`url(#${gradientId})`}
              stroke={up ? "#FF3B3B" : "#3B6EFF"}
              strokeWidth="1"
            />
          </g>
        );
      })}
    </svg>
  );
}

export default function App() {
  return <GameGraph />;
}
