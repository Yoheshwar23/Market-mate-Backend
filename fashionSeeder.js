// productSeeder.js
const mongoose = require("mongoose");
const Product = require("./models/productModel");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI || "your_default_mongo_uri_here";

const electronicsProducts = [
  {
    title: "NCERT Class 10 Science Textbook",
    owner: "694927e4dabffa74a5d3ce85",
    description: "Latest CBSE curriculum science textbook for class 10.",
    category: "books & stationery",
    subCategory: "academic--books",
    price: 299,
    discount: 10,
    offers: [
      { title: "Academic discount", discount: 30 },
      { title: "No-cost EMI available", discount: null },
      { title: "Exchange bonus up to", discount: 100 },
    ],
    specs: [
      { key: "Class", value: "10th" },
      { key: "Subject", value: "Science" },
      { key: "Board", value: "CBSE/NCERT" },
      { key: "Edition", value: "2025-26" },
      { key: "Pages", value: "256" },
    ],
    averageRating: 4.8,
  },
  {
    title: "RD Sharma Mathematics Class 9",
    owner: "694927e4dabffa74a5d3ce85",
    description: "Comprehensive mathematics textbook with solved examples.",
    category: "books & stationery",
    subCategory: "academic--books",
    price: 599,
    discount: 15,
    offers: [
      { title: "Maths discount", discount: 90 },
      { title: "No-cost EMI available", discount: null },
      { title: "Exchange bonus up to", discount: 200 },
    ],
    specs: [
      { key: "Class", value: "9th" },
      { key: "Board", value: "CBSE/ICSE" },
      { key: "Problems", value: "5000+ solved" },
      { key: "Edition", value: "2025" },
    ],
    averageRating: 4.7,
  },
  {
    title: "The Psychology of Money",
    owner: "694927e4dabffa74a5d3ce85",
    description: "Timeless lessons on wealth and happiness by Morgan Housel.",
    category: "books & stationery",
    subCategory: "novels",

    price: 399,
    discount: 20,
    offers: [
      { title: "Bestseller discount", discount: 80 },
      { title: "No-cost EMI available", discount: null },
      { title: "Exchange bonus up to", discount: 150 },
    ],
    specs: [
      { key: "Author", value: "Morgan Housel" },
      { key: "Genre", value: "Personal finance" },
      { key: "Pages", value: "256" },
      { key: "Language", value: "English" },
    ],
    averageRating: 4.6,
  },
  {
    title: "Sunrise on the Reaping",
    owner: "694927e4dabffa74a5d3ce85",
    description: "Latest Hunger Games prequel by Suzanne Collins.",
    category: "books & stationery",
    subCategory: "novels",

    price: 699,
    discount: 12,
    offers: [
      { title: "Fantasy discount", discount: 84 },
      { title: "No-cost EMI available", discount: null },
      { title: "Exchange bonus up to", discount: 250 },
    ],
    specs: [
      { key: "Series", value: "Hunger Games #5" },
      { key: "Author", value: "Suzanne Collins" },
      { key: "Genre", value: "Dystopian" },
      { key: "Release", value: "2025" },
    ],
    averageRating: 4.5,
  },
  {
    title: "Amar Chitra Katha Mahabharata",
    owner: "694927e4dabffa74a5d3ce85",
    description: "Classic Indian mythology comics set.",
    category: "books & stationery",
    subCategory: "comics",

    price: 299,
    discount: 25,
    offers: [
      { title: "Comics discount", discount: 75 },
      { title: "No-cost EMI available", discount: null },
      { title: "Exchange bonus up to", discount: 100 },
    ],
    specs: [
      { key: "Series", value: "Amar Chitra Katha" },
      { key: "Story", value: "Mahabharata" },
      { key: "Age", value: "8+" },
      { key: "Format", value: "Full color" },
    ],
    averageRating: 4.7,
  },
  {
    title: "Chacha Chaudhary Comics Vol 1",
    owner: "694927e4dabffa74a5d3ce85",
    description: "Iconic Indian comic adventures of Chacha Chaudhary.",
    category: "books & stationery",
    subCategory: "comics",

    price: 199,
    discount: 20,
    offers: [
      { title: "Indian comics discount", discount: 40 },
      { title: "No-cost EMI available", discount: null },
      { title: "Exchange bonus up to", discount: 70 },
    ],
    specs: [
      { key: "Creator", value: "Pran Kumar Sharma" },
      { key: "Volume", value: "1" },
      { key: "Pages", value: "64" },
    ],
    averageRating: 4.6,
  },
  {
    title: "Arihant UPSC Prelims Guide 2026",
    owner: "694927e4dabffa74a5d3ce85",
    description: "Complete study material for UPSC CSE Prelims.",
    category: "books & stationery",
    subCategory: "exam-prep",

    price: 999,
    discount: 15,
    offers: [
      { title: "UPSC discount", discount: 150 },
      { title: "No-cost EMI available", discount: null },
      { title: "Exchange bonus up to", discount: 350 },
    ],
    specs: [
      { key: "Exam", value: "UPSC CSE Prelims" },
      { key: "Year", value: "2026" },
      { key: "Subjects", value: "GS + CSAT" },
      { key: "Practice", value: "5000+ MCQs" },
    ],
    averageRating: 4.5,
  },
  {
    title: "RS Aggarwal Quantitative Aptitude",
    owner: "694927e4dabffa74a5d3ce85",
    description: "Comprehensive quantitative aptitude for competitive exams.",
    category: "books & stationery",
    subCategory: "exam-prep",
    price: 699,
    discount: 18,
    offers: [
      { title: "Aptitude discount", discount: 126 },
      { title: "No-cost EMI available", discount: null },
      { title: "Exchange bonus up to", discount: 250 },
    ],
    specs: [
      { key: "Edition", value: "Latest" },
      { key: "Problems", value: "5000+" },
      { key: "Exams", value: "SSC/Bank/Railway" },
    ],
    averageRating: 4.6,
  },
  {
    title: "Classmate Notebook A4 Ruled",
    owner: "694927e4dabffa74a5d3ce85",
    description: "Premium quality A4 ruled notebook 300 pages.",
    category: "books & stationery",
    subCategory: "office-stationery",

    price: 99,
    discount: 10,
    offers: [
      { title: "Stationery discount", discount: 10 },
      { title: "No-cost EMI available", discount: null },
      { title: "Exchange bonus up to", discount: 30 },
    ],
    specs: [
      { key: "Size", value: "A4" },
      { key: "Pages", value: "300" },
      { key: "Ruling", value: "Single line" },
      { key: "Cover", value: "Hard laminated" },
    ],
    averageRating: 4.7,
  },
  {
    title: "Pilot V7 Roller Ball Pen",
    owner: "694927e4dabffa74a5d3ce85",
    description: "Smooth writing roller ball pen pack of 5.",
    category: "books & stationery",
    subCategory: "office-stationery",

    price: 299,
    discount: 20,
    offers: [
      { title: "Pens discount", discount: 60 },
      { title: "No-cost EMI available", discount: null },
      { title: "Exchange bonus up to", discount: 100 },
    ],
    specs: [
      { key: "Pack", value: "5 pens" },
      { key: "Tip", value: "0.7mm" },
      { key: "Ink", value: "Liquid ink" },
      { key: "Colors", value: "Black, Blue" },
    ],
    averageRating: 4.8,
  },
  {
    title: "Faber-Castell Triangular Colored Pencils",
    owner: "694927e4dabffa74a5d3ce85",
    description: "24 shades ergonomic triangular colored pencils set.",
    category: "books & stationery",
    subCategory: "art-supplies",

    price: 399,
    discount: 15,
    offers: [
      { title: "Art discount", discount: 60 },
      { title: "No-cost EMI available", discount: null },
      { title: "Exchange bonus up to", discount: 150 },
    ],
    specs: [
      { key: "Set", value: "24 colors" },
      { key: "Shape", value: "Triangular grip" },
      { key: "Age", value: "3+" },
      { key: "Lead", value: "3.3mm" },
    ],
    averageRating: 4.6,
  },
  {
    title: "Camel Watercolor Cakes 12 Shades",
    owner: "694927e4dabffa74a5d3ce85",
    description: "Student grade watercolor cakes with brush.",
    category: "books & stationery",
    subCategory: "art-supplies",
    price: 199,
    discount: 22,
    offers: [
      { title: "Painting discount", discount: 44 },
      { title: "No-cost EMI available", discount: null },
      { title: "Exchange bonus up to", discount: 70 },
    ],
    specs: [
      { key: "Shades", value: "12" },
      { key: "Grade", value: "Student" },
      { key: "Includes", value: "Brush + palette" },
      { key: "Brand", value: "Camel" },
    ],
    averageRating: 4.5,
  },
  {
    title: "NCERT Class 12 Accountancy Vol 1",
    owner: "694927e4dabffa74a5d3ce85",
    description: "CBSE commerce textbook for class 12.",
    category: "books & stationery",
    subCategory: "academic--books",
    price: 349,
    discount: 12,
    offers: [
      { title: "Commerce discount", discount: 42 },
      { title: "No-cost EMI available", discount: null },
      { title: "Exchange bonus up to", discount: 120 },
    ],
    specs: [
      { key: "Class", value: "12th" },
      { key: "Subject", value: "Accountancy Vol 1" },
      { key: "Board", value: "CBSE" },
    ],
    averageRating: 4.8,
  },
  {
    title: "Atomic Habits by James Clear",
    owner: "694927e4dabffa74a5d3ce85",
    description: "Practical guide to building good habits.",
    category: "books & stationery",
    subCategory: "novels",

    price: 499,
    discount: 18,
    offers: [
      { title: "Self-help discount", discount: 90 },
      { title: "No-cost EMI available", discount: null },
      { title: "Exchange bonus up to", discount: 180 },
    ],
    specs: [
      { key: "Genre", value: "Self-improvement" },
      { key: "Author", value: "James Clear" },
      { key: "Pages", value: "320" },
    ],
    averageRating: 4.7,
  },
  {
    title: "Wren & Martin English Grammar",
    owner: "694927e4dabffa74a5d3ce85",
    description: "Classic English grammar and composition book.",
    category: "books & stationery",
    subCategory: "academic--books",
    price: 450,
    discount: 15,
    offers: [
      { title: "Grammar discount", discount: 68 },
      { title: "No-cost EMI available", discount: null },
      { title: "Exchange bonus up to", discount: 160 },
    ],
    specs: [
      { key: "Edition", value: "High school" },
      { key: "Exercises", value: "Comprehensive" },
      { key: "Level", value: "Class 9-12" },
    ],
    averageRating: 4.8,
  },
  {
    title: "Lucid Chart Paper Roll",
    owner: "694927e4dabffa74a5d3ce85",
    description: "60gsm chart paper roll for art and projects.",
    category: "books & stationery",
    subCategory: "art-supplies",
    price: 149,
    discount: 20,
    offers: [
      { title: "Project discount", discount: 30 },
      { title: "No-cost EMI available", discount: null },
      { title: "Exchange bonus up to", discount: 50 },
    ],
    specs: [
      { key: "Size", value: "A1 roll 100m" },
      { key: "GSM", value: "60" },
      { key: "Colors", value: "White" },
    ],
    averageRating: 4.4,
  },
  {
    title: "Arihant NEET Previous Papers",
    owner: "694927e4dabffa74a5d3ce85",
    description: "NEET last 10 years solved papers with explanations.",
    category: "books & stationery",
    subCategory: "exam-prep",

    price: 799,
    discount: 16,
    offers: [
      { title: "NEET discount", discount: 128 },
      { title: "No-cost EMI available", discount: null },
      { title: "Exchange bonus up to", discount: 300 },
    ],
    specs: [
      { key: "Exam", value: "NEET" },
      { key: "Years", value: "Last 10 years" },
      { key: "Subjects", value: "PCB" },
    ],
    averageRating: 4.6,
  },
  {
    title: "Mongkok Gel Pens Pack 10",
    owner: "694927e4dabffa74a5d3ce85",
    description: "0.5mm tip gel pens in assorted colors.",
    category: "books & stationery",
    subCategory: "office-stationery",
    price: 199,
    discount: 25,
    offers: [
      { title: "Gel pens discount", discount: 50 },
      { title: "No-cost EMI available", discount: null },
      { title: "Exchange bonus up to", discount: 70 },
    ],
    specs: [
      { key: "Pack", value: "10 pens" },
      { key: "Tip", value: "0.5mm" },
      { key: "Colors", value: "10 assorted" },
    ],
    averageRating: 4.5,
  },
];

async function seedProducts() {
  try {
    await mongoose.connect(MONGO_URI);

    const result = await Product.insertMany(electronicsProducts);
    console.log(`${result.length}  products seeded successfully!`);

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seedProducts();
