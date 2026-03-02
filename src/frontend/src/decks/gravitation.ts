/**
 * Built-in deck: Gravitation (NEET Physics)
 * 9 high-yield NCERT cards with NEET traps and NCERT hooks.
 */

import type { BuiltinDeck } from "./reproductiveHealth";

export const gravitationDeck: BuiltinDeck = {
  id: "builtin-gravitation",
  name: "Gravitation",
  description:
    "9 high-yield NCERT cards covering Newton's law of gravitation, gravitational potential, escape velocity, orbital motion, and Kepler's laws — with NEET traps and NCERT hooks on every card.",
  isBuiltin: true,
  section: "Physics",
  cards: [
    {
      id: 1,
      cardType: "Law",
      title: "Newton's Law of Gravitation",
      front: "State Newton's Law of Gravitation.",
      back: "F = G m₁m₂ / r²",
      trap: "G is the Universal Gravitational Constant. The force is always attractive and acts along the line joining the centers of the two masses.",
      hook: "Universal Inverse Square Law",
    },
    {
      id: 2,
      cardType: "Formula",
      title: "Gravitational Acceleration",
      front:
        "What is the formula for Gravitational Acceleration (g) at a planet's surface?",
      back: "g = GM / R²",
      trap: "g is independent of the mass of the falling object (m). It only depends on the Planet's mass (M) and radius (R).",
      hook: "Surface Gravity Formula",
    },
    {
      id: 3,
      cardType: "Definition",
      title: "Weight",
      front: "Define Weight (W) in terms of gravitation.",
      back: "W = mg",
      trap: "Weight is a force and changes with altitude, depth, and latitude. Mass remains constant.",
      hook: "Local Gravitational Pull",
    },
    {
      id: 4,
      cardType: "Formula",
      title: "Gravitational Potential",
      front: "Identify the formula for Gravitational Potential (V).",
      back: "V = −GM / r",
      trap: "V is always negative. It represents the work done per unit mass. It is zero at infinity (maximum value).",
      hook: "Scalar Potential Field",
    },
    {
      id: 5,
      cardType: "Formula",
      title: "Gravitational Potential Energy",
      front: "Formula for Gravitational Potential Energy (U) of a system.",
      back: "U = −GMm / r",
      trap: "NEET Trap: As r increases, U increases (becomes less negative). Don't ignore the minus sign in comparisons!",
      hook: "Interaction Energy",
    },
    {
      id: 6,
      cardType: "Formula",
      title: "Escape Velocity",
      front: "Calculate Escape Velocity (v_e) from the surface of a planet.",
      back: "v_e = √(2GM / R) = √(2gR)",
      trap: "v_e is independent of the mass of the projectile and the angle of projection. Launching at 45° vs 90° doesn't change v_e.",
      hook: "Breaking the Gravitational Bound",
    },
    {
      id: 7,
      cardType: "Formula",
      title: "Orbital Velocity",
      front: "Formula for Orbital Velocity (v_o) of a satellite.",
      back: "v_o = √(GM / r)",
      trap: "v_o depends on the height of the satellite. For a satellite near surface: v_e = √2 × v_o.",
      hook: "Critical Orbital Speed",
    },
    {
      id: 8,
      cardType: "Formula",
      title: "Satellite Time Period",
      front: "What is the Time Period (T) of a satellite in circular orbit?",
      back: "T = 2π√(r³ / GM)",
      trap: "Mass of the satellite (m) cancels out. T depends only on the orbital radius and the planet's mass.",
      hook: "Satellite Period Relation",
    },
    {
      id: 9,
      cardType: "Law",
      title: "Kepler's Third Law",
      front: "State Kepler's Third Law (Law of Periods).",
      back: "T² ∝ r³",
      trap: "Ensure you use the semi-major axis (or radius) correctly. Graphs of T² vs r³ are always straight lines through origin.",
      hook: "Harmonic Law of Motion",
    },
  ],
};
