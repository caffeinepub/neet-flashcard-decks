/**
 * Built-in deck: Electrostatics (NEET Physics)
 * 12 high-yield NCERT cards with NEET traps and NCERT hooks.
 */

import type { BuiltinDeck } from "./reproductiveHealth";

export const electrostaticsDeck: BuiltinDeck = {
  id: "builtin-electrostatics",
  name: "Electrostatics",
  description:
    "12 high-yield NCERT cards covering Coulomb's law, electric field, flux, Gauss's law, potential, capacitance, and energy storage — with NEET traps and NCERT hooks on every card.",
  isBuiltin: true,
  section: "Physics",
  cards: [
    {
      id: 1,
      cardType: "Law",
      title: "Coulomb's Law",
      front: "State Coulomb's Law for the force between two point charges.",
      back: "F = (1/4πε₀)(q₁q₂/r²)",
      trap: "The force is along the line joining the centers. Remember that ε₀ is the permittivity of free space; if a medium is present, F decreases by factor K (dielectric constant).",
      hook: "Electrostatic Inverse Square Law",
    },
    {
      id: 2,
      cardType: "Definition",
      title: "Electric Field",
      front: "Define Electric Field (E) in terms of Force and Charge.",
      back: "E = F / q",
      trap: "E is a vector. The direction of E is the direction of force on a POSITIVE test charge. If the test charge is negative, force and field are opposite.",
      hook: "Force per unit Charge",
    },
    {
      id: 3,
      cardType: "Formula",
      title: "E due to Point Charge",
      front:
        "Formula for Electric Field due to a point charge Q at distance r.",
      back: "E = (1/4πε₀)(Q/r²)",
      trap: "E follows the inverse square law (1/r²). Note the difference from Potential (1/r).",
      hook: "Point Source Intensity",
    },
    {
      id: 4,
      cardType: "Definition",
      title: "Electric Flux",
      front: "Define Electric Flux (Φ).",
      back: "Φ = E · A = EA cosθ",
      trap: "θ is the angle between Electric Field and the AREA VECTOR (which is normal to the surface). If E is parallel to surface, θ = 90° and Φ = 0.",
      hook: "Flow of Electric Field",
    },
    {
      id: 5,
      cardType: "Law",
      title: "Gauss's Law",
      front: "State Gauss's Law for electrostatics.",
      back: "Φ = q_enclosed / ε₀",
      trap: "NEET Trap: Flux depends ONLY on the net charge inside the Gaussian surface. Charges outside do NOT contribute to total flux, though they contribute to the E-field at points on the surface.",
      hook: "Enclosed Charge Principle",
    },
    {
      id: 6,
      cardType: "Formula",
      title: "Electric Potential",
      front: "What is the formula for Electric Potential (V)?",
      back: "V = W / q",
      trap: "Potential is a scalar quantity. Always include the sign of the charge (+Q or -Q) when calculating V.",
      hook: "Work per unit Charge",
    },
    {
      id: 7,
      cardType: "Formula",
      title: "V due to Point Charge",
      front: "Formula for Electric Potential due to a point charge Q.",
      back: "V = (1/4πε₀)(Q / r)",
      trap: "V follows a 1/r relationship. Unlike field, V does not square the distance.",
      hook: "Scalar Field Value",
    },
    {
      id: 8,
      cardType: "Relation",
      title: "E and V Relation",
      front:
        "What is the relation between Electric Field (E) and Potential (V)?",
      back: "E = −dV / dr",
      trap: "The negative sign indicates that Electric Field points in the direction of DECREASING potential.",
      hook: "Potential Gradient",
    },
    {
      id: 9,
      cardType: "Formula",
      title: "Electric Potential Energy",
      front:
        "Formula for Electric Potential Energy (U) of a charge q in potential V.",
      back: "U = qV = (1/4πε₀)(q₁q₂ / r)",
      trap: "U is a scalar. For two like charges, U is positive; for opposite charges, U is negative. U increases as like charges are brought closer.",
      hook: "Interaction Energy",
    },
    {
      id: 10,
      cardType: "Definition",
      title: "Capacitance",
      front: "Define Capacitance (C).",
      back: "C = Q / V",
      trap: "Capacitance is a constant for a given conductor shape/size. It does NOT depend on Q or V, just like Resistance doesn't depend on V or I.",
      hook: "Charge Storage Capacity",
    },
    {
      id: 11,
      cardType: "Formula",
      title: "Parallel Plate Capacitor",
      front: "Formula for Capacitance of a Parallel Plate Capacitor.",
      back: "C = ε₀A / d",
      trap: "NEET Trap: If a dielectric of constant K is inserted, C becomes K times larger (C' = K ε₀A / d).",
      hook: "Geometric Storage Factor",
    },
    {
      id: 12,
      cardType: "Formula",
      title: "Energy in Capacitor",
      front: "Formula for Energy stored in a Capacitor.",
      back: "U = ½CV² = Q² / 2C = ½QV",
      trap: "If a capacitor is disconnected from battery, Q remains constant. If it stays connected, V remains constant. Choose your formula based on what is constant!",
      hook: "Stored Electrostatic Energy",
    },
  ],
};
