import { FC } from "react";

/**
 * CheckIcon Component
 * Renders a green checkmark icon with a semi-transparent background.
 * Updated to use FC instead of VFC for React 18 compatibility.
 */
const CheckIcon: FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{
      position: "absolute",
      bottom: "8px",
      right: "8px",
      width: "28px",
      height: "28px",
      color: "#4caf50", // Standard success green
      backgroundColor: "rgba(0,0,0,0.6)", // Background for contrast on bright covers
      borderRadius: "50%",
      padding: "2px",
      zIndex: 5, // Ensures it stays above the cover art
      boxShadow: "0 2px 4px rgba(0,0,0,0.5)"
    }}
  >
    <path fill="none" d="M0 0h24v24H0z" />
    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-.997-6l7.07-7.071-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414L11.003 16z" />
  </svg>
);

export default CheckIcon;