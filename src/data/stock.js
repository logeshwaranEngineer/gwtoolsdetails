// src/data/stock.js

// === Import your images (adjust paths to your assets) ===


import frcPantImg from "../assets/frc_pant1.svg";
import frcShirtImg from "../assets/frc_shirt1.svg";
import greyShirtImg from "../assets/grey_shirt.svg"; // sample reuse
import safetyShoeImg from "../assets/shoes.svg";
import safetyGlassImg from "../assets/glass.svg";
import earplugImg from "../assets/earplug1.svg";
import glovesImg from "../assets/glove_holder1.svg";
import helmetImg from "../assets/helmet1.svg";
import holderImg from "../assets/glove_holder1.svg";
import maskImg from "../assets/mask.svg";
// ====== INITIAL STOCK (HIERARCHICAL: category -> item -> variants) ======
export const initialStock = [
  {
    id: 1,
    category: "Shoes",
    name: "Safety Shoe",
    brand: "KINGS",
    variants: [
      { code: "8", label: "Size 8", balance: 7 },
      { code: "9", label: "Size 9", balance: 17 },
    ],
    img: safetyShoeImg,
  },
  {
    id: 2,
    category: "Gloves",
    name: "Hand Gloves",
    brand: "PROSAFE",
    variants: [{ code: "STD", label: "Standard", balance: 482 }],
    img: glovesImg,
  },
  {
    id: 3,
    category: "Eye Protection",
    name: "Safety Glass",
    brand: "GENERIC",
    variants: [{ code: "STD", label: "Standard", balance: 168 }],
    img: safetyGlassImg,
  },
  {
    id: 4,
    category: "Hearing",
    name: "Ear Plug",
    brand: "GENERIC",
    variants: [{ code: "STD", label: "Standard", balance: 200 }],
    img: earplugImg,
  },
  {
    id: 5,
    category: "Head Protection",
    name: "Safety Helmet (Yellow)",
    brand: "GENERIC",
    variants: [
      { code: "S", label: "Size S", balance: 6 },
      { code: "M", label: "Size M", balance: 20 },
      { code: "L", label: "Size L", balance: 10 },
    ],
    img: helmetImg,
  },
  {
    id: 6,
    category: "Respiratory",
    name: "Mask (N95)",
    brand: "GENERIC",
    variants: [{ code: "STD", label: "Standard", balance: 47 }],
    img: maskImg,
  },
  {
    id: 7,
    category: "Clothing",
    name: "FRC Shirt",
    brand: "GENERIC",
    variants: [
      { code: "M", label: "M", balance: 10 },
      { code: "L", label: "L", balance: 9 },
      { code: "XL", label: "XL", balance: 6 },
    ],
    img: frcShirtImg,
  },
  {
    id: 8,
    category: "Clothing",
    name: "FRC Pant",
    brand: "GENERIC",
    variants: [
      { code: "30", label: "30", balance: 8 },
      { code: "32", label: "32", balance: 9 },
      { code: "34", label: "34", balance: 8 },
    ],
    img: frcPantImg,
  },
  {
    id: 9,
    category: "Clothing",
    name: "Grey Shirt",
    brand: "GENERIC",
    variants: [
      { code: "M", label: "M", balance: 14 },
      { code: "L", label: "L", balance: 13 },
      { code: "XL", label: "XL", balance: 13 },
    ],
    img: greyShirtImg,
  },
  {
    id: 10,
    category: "Accessories",
    name: "Glove Holder",
    brand: "GENERIC",
    variants: [{ code: "STD", label: "Standard", balance: 60 }],
    img: holderImg,
  },
];
