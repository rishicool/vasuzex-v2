import React, { useState } from "react";

const ReadMore = ({ text = "", limit = 100 }) => {
  const [expanded, setExpanded] = useState(false);

  // if text is shorter than limit, show full text without toggle
  if (text.length <= limit) {
    return <span>{text}</span>;
  }

  const displayText = expanded ? text : text.slice(0, limit) + "...";

  return (
    <span style={{ fontFamily: "inherit", lineHeight: 1.5 }}>
      {displayText}{" "}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          color: "#007bff",
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          fontSize: "inherit",
          textDecoration: "underline",
        }}
      >
        {expanded ? "Read less" : "Read more"}
      </button>
    </span>
  );
};

export { ReadMore };
