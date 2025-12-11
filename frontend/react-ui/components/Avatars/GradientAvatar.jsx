import React from "react";

/**
 * Gradient Pastel Avatars (Style 4 - Option B)
 * - 5 categories × 10 variants = 50 components
 * - Props: size (number, default 64), className (string)
 *
 * Usage:
 * import { Store1 } from "@vasuzex/react";
 * <Store1 size={80} className="inline-block" />
 */

/* ---------- Shared Gradients ---------- */
const GradientsDefs = ({ idPrefix = "g" }) => (
  <defs>
    <linearGradient id={`${idPrefix}p1`} x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stopColor="#f9a8d4" />
      <stop offset="100%" stopColor="#c084fc" />
    </linearGradient>
    <linearGradient id={`${idPrefix}p2`} x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stopColor="#fcd34d" />
      <stop offset="100%" stopColor="#f97316" />
    </linearGradient>
    <linearGradient id={`${idPrefix}p3`} x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stopColor="#7dd3fc" />
      <stop offset="100%" stopColor="#06b6d4" />
    </linearGradient>
    <linearGradient id={`${idPrefix}p4`} x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stopColor="#fbcfe8" />
      <stop offset="100%" stopColor="#e9d5ff" />
    </linearGradient>
  </defs>
);

/* ---------- Helper to build svg props ---------- */
const svgProps = (size = 64) => ({
  width: size,
  height: size,
  viewBox: "0 0 64 64",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
});

/* ---------- Utility: wrap component with defs (unique idPrefix) ---------- */
const withDefs = (Comp, idPrefix) => (props) => (
  <svg {...svgProps(props.size)} className={props.className}>
    <GradientsDefs idPrefix={idPrefix} />
    <Comp {...props} idPrefix={idPrefix} />
  </svg>
);

/* ---------- Category: Stores (10) ---------- */
/* Slight variations: awnings, storefront shapes, window arrangements */
const StoreBase = ({ idPrefix, variant = 1 }) => {
  const gA = `${idPrefix}p1`;
  const gB = `${idPrefix}p2`;
  const gC = `${idPrefix}p3`;
  const awning = variant % 2 === 0;
  return (
    <>
      <rect x="8" y="18" width="48" height="34" rx="6" fill={`url(#${gA})`} />
      {awning && <path d="M8 18 H56 L50 10 H14 Z" fill={`url(#${gB})`} opacity="0.95" />}
      {!awning && <path d="M8 18 H56 L32 6 Z" fill={`url(#${gB})`} opacity="0.9" />}
      <rect x="14" y="30" width="36" height="18" rx="4" fill="#ffffff" opacity="0.9" />
      <rect x="20" y="32" width="12" height="12" rx="2" fill={`url(#${gC})`} />
      <rect x="36" y="32" width="8" height="12" rx="2" fill="#fff" opacity="0.95" />
    </>
  );
};

export const Store1 = withDefs((p) => <StoreBase {...p} variant={1} />, "s1");
export const Store2 = withDefs((p) => <StoreBase {...p} variant={2} />, "s2");
export const Store3 = withDefs((p) => <StoreBase {...p} variant={3} />, "s3");
export const Store4 = withDefs((p) => <StoreBase {...p} variant={4} />, "s4");
export const Store5 = withDefs((p) => <StoreBase {...p} variant={5} />, "s5");
export const Store6 = withDefs((p) => <StoreBase {...p} variant={6} />, "s6");
export const Store7 = withDefs((p) => <StoreBase {...p} variant={7} />, "s7");
export const Store8 = withDefs((p) => <StoreBase {...p} variant={8} />, "s8");
export const Store9 = withDefs((p) => <StoreBase {...p} variant={9} />, "s9");
export const Store10 = withDefs((p) => <StoreBase {...p} variant={10} />, "s10");

/* ---------- Category: Customers (10) ---------- */
/* Round heads, shirts with different gradient fills */
const CustomerBase = ({ idPrefix, variant = 1 }) => {
  const gA = `${idPrefix}p1`;
  const gB = `${idPrefix}p3`;
  const hairAccent = variant % 3 === 0;
  return (
    <>
      <circle cx="32" cy="18" r="12" fill={`url(#${gA})`} />
      <rect x="14" y="34" width="36" height="18" rx="8" fill={`url(#${gB})`} />
      {hairAccent && <path d="M20 12 C28 4, 40 4, 44 12" fill="#fff" opacity="0.12" />}
      <circle cx="27" cy="16" r="1.6" fill="#374151" />
      <circle cx="37" cy="16" r="1.6" fill="#374151" />
    </>
  );
};

export const Customer1 = withDefs((p) => <CustomerBase {...p} variant={1} />, "c1");
export const Customer2 = withDefs((p) => <CustomerBase {...p} variant={2} />, "c2");
export const Customer3 = withDefs((p) => <CustomerBase {...p} variant={3} />, "c3");
export const Customer4 = withDefs((p) => <CustomerBase {...p} variant={4} />, "c4");
export const Customer5 = withDefs((p) => <CustomerBase {...p} variant={5} />, "c5");
export const Customer6 = withDefs((p) => <CustomerBase {...p} variant={6} />, "c6");
export const Customer7 = withDefs((p) => <CustomerBase {...p} variant={7} />, "c7");
export const Customer8 = withDefs((p) => <CustomerBase {...p} variant={8} />, "c8");
export const Customer9 = withDefs((p) => <CustomerBase {...p} variant={9} />, "c9");
export const Customer10 = withDefs((p) => <CustomerBase {...p} variant={10} />, "c10");

/* ---------- Category: Delivery Partners (10) ---------- */
/* Bikes / scooters / bag box variations */
const DeliveryBase = ({ idPrefix, variant = 1 }) => {
  const gA = `${idPrefix}p3`;
  const gB = `${idPrefix}p1`;
  const box = variant % 2 === 0;
  return (
    <>
      <rect x="6" y="10" width="52" height="44" rx="8" fill={`url(#${gB})`} />
      <g transform="translate(6,6)">
        <circle cx="14" cy="38" r="4" fill="#fff" opacity="0.9" />
        <circle cx="40" cy="38" r="4" fill="#fff" opacity="0.9" />
        <path d="M14 34 L26 24 L38 24" stroke={`url(#${gA})`} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {box && <rect x="24" y="12" width="16" height="12" rx="2" fill="#fff" opacity="0.95" />}
      </g>
    </>
  );
};

export const Delivery1 = withDefs((p) => <DeliveryBase {...p} variant={1} />, "d1");
export const Delivery2 = withDefs((p) => <DeliveryBase {...p} variant={2} />, "d2");
export const Delivery3 = withDefs((p) => <DeliveryBase {...p} variant={3} />, "d3");
export const Delivery4 = withDefs((p) => <DeliveryBase {...p} variant={4} />, "d4");
export const Delivery5 = withDefs((p) => <DeliveryBase {...p} variant={5} />, "d5");
export const Delivery6 = withDefs((p) => <DeliveryBase {...p} variant={6} />, "d6");
export const Delivery7 = withDefs((p) => <DeliveryBase {...p} variant={7} />, "d7");
export const Delivery8 = withDefs((p) => <DeliveryBase {...p} variant={8} />, "d8");
export const Delivery9 = withDefs((p) => <DeliveryBase {...p} variant={9} />, "d9");
export const Delivery10 = withDefs((p) => <DeliveryBase {...p} variant={10} />, "d10");

/* ---------- Category: Male Avatars (10) ---------- */
/* Distinct hair / shirt combos using gradients */
const MaleBase = ({ idPrefix, variant = 1 }) => {
  const gShirt = `${idPrefix}p2`;
  const gFace = `${idPrefix}p1`;
  const hair = variant % 2 === 0 ? "#1f2937" : "#3b82f6";
  return (
    <>
      <circle cx="32" cy="18" r="12" fill={`url(#${gFace})`} />
      <path d="M20 12 C26 6, 40 6, 44 12 C44 22, 36 22, 32 22 C28 22, 20 22, 20 12 Z" fill={hair} opacity="0.12" />
      <rect x="14" y="34" width="36" height="18" rx="6" fill={`url(#${gShirt})`} />
      <circle cx="27" cy="16" r="1.6" fill="#111827" />
      <circle cx="37" cy="16" r="1.6" fill="#111827" />
    </>
  );
};

export const Male1 = withDefs((p) => <MaleBase {...p} variant={1} />, "m1");
export const Male2 = withDefs((p) => <MaleBase {...p} variant={2} />, "m2");
export const Male3 = withDefs((p) => <MaleBase {...p} variant={3} />, "m3");
export const Male4 = withDefs((p) => <MaleBase {...p} variant={4} />, "m4");
export const Male5 = withDefs((p) => <MaleBase {...p} variant={5} />, "m5");
export const Male6 = withDefs((p) => <MaleBase {...p} variant={6} />, "m6");
export const Male7 = withDefs((p) => <MaleBase {...p} variant={7} />, "m7");
export const Male8 = withDefs((p) => <MaleBase {...p} variant={8} />, "m8");
export const Male9 = withDefs((p) => <MaleBase {...p} variant={9} />, "m9");
export const Male10 = withDefs((p) => <MaleBase {...p} variant={10} />, "m10");

/* ---------- Category: Female Avatars (10) ---------- */
/* Distinct hair styles, scarves, and shirts */
const FemaleBase = ({ idPrefix, variant = 1 }) => {
  const gFace = `${idPrefix}p1`;
  const gTop = `${idPrefix}p3`;
  const hairColor = variant % 3 === 0 ? "#a78bfa" : "#fb7185";
  return (
    <>
      <circle cx="32" cy="18" r="12" fill={`url(#${gFace})`} />
      <path d="M22 14 C26 6, 38 6, 42 14 C46 22, 40 24, 32 24 C24 24, 18 22, 22 14 Z" fill={hairColor} opacity="0.12" />
      <rect x="14" y="34" width="36" height="18" rx="8" fill={`url(#${gTop})`} />
      <circle cx="27" cy="16" r="1.4" fill="#111827" />
      <circle cx="37" cy="16" r="1.4" fill="#111827" />
    </>
  );
};

export const Female1 = withDefs((p) => <FemaleBase {...p} variant={1} />, "f1");
export const Female2 = withDefs((p) => <FemaleBase {...p} variant={2} />, "f2");
export const Female3 = withDefs((p) => <FemaleBase {...p} variant={3} />, "f3");
export const Female4 = withDefs((p) => <FemaleBase {...p} variant={4} />, "f4");
export const Female5 = withDefs((p) => <FemaleBase {...p} variant={5} />, "f5");
export const Female6 = withDefs((p) => <FemaleBase {...p} variant={6} />, "f6");
export const Female7 = withDefs((p) => <FemaleBase {...p} variant={7} />, "f7");
export const Female8 = withDefs((p) => <FemaleBase {...p} variant={8} />, "f8");
export const Female9 = withDefs((p) => <FemaleBase {...p} variant={9} />, "f9");
export const Female10 = withDefs((p) => <FemaleBase {...p} variant={10} />, "f10");

/* ---------- Export Map for convenience ---------- */
export const AvatarMap = {
  // stores
  Store1,
  Store2,
  Store3,
  Store4,
  Store5,
  Store6,
  Store7,
  Store8,
  Store9,
  Store10,
  // customers
  Customer1,
  Customer2,
  Customer3,
  Customer4,
  Customer5,
  Customer6,
  Customer7,
  Customer8,
  Customer9,
  Customer10,
  // delivery
  Delivery1,
  Delivery2,
  Delivery3,
  Delivery4,
  Delivery5,
  Delivery6,
  Delivery7,
  Delivery8,
  Delivery9,
  Delivery10,
  // male
  Male1,
  Male2,
  Male3,
  Male4,
  Male5,
  Male6,
  Male7,
  Male8,
  Male9,
  Male10,
  // female
  Female1,
  Female2,
  Female3,
  Female4,
  Female5,
  Female6,
  Female7,
  Female8,
  Female9,
  Female10,
};

export default AvatarMap;
