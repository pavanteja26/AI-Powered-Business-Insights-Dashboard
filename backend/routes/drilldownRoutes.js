import express from "express";

const router = express.Router();

// Mock hierarchical dataset: Sales -> Region -> Country -> Product
const drilldownData = {
  root: [
    { name: "North America", value: 120000, category: "Region" },
    { name: "Europe", value: 95000, category: "Region" },
    { name: "Asia", value: 150000, category: "Region" },
  ],
  "North America": [
    { name: "USA", value: 90000, category: "Country" },
    { name: "Canada", value: 30000, category: "Country" },
  ],
  Europe: [
    { name: "UK", value: 40000, category: "Country" },
    { name: "Germany", value: 35000, category: "Country" },
    { name: "France", value: 20000, category: "Country" },
  ],
  Asia: [
    { name: "China", value: 80000, category: "Country" },
    { name: "Japan", value: 50000, category: "Country" },
    { name: "India", value: 20000, category: "Country" },
  ],
  USA: [
    { name: "Laptops", value: 45000, category: "Product" },
    { name: "Phones", value: 30000, category: "Product" },
    { name: "Tablets", value: 15000, category: "Product" },
  ],
  Canada: [
    { name: "Laptops", value: 15000, category: "Product" },
    { name: "Phones", value: 10000, category: "Product" },
    { name: "Tablets", value: 5000, category: "Product" },
  ],
  UK: [
    { name: "Laptops", value: 20000, category: "Product" },
    { name: "Phones", value: 15000, category: "Product" },
    { name: "Tablets", value: 5000, category: "Product" },
  ],
  Germany: [
    { name: "Laptops", value: 18000, category: "Product" },
    { name: "Phones", value: 12000, category: "Product" },
    { name: "Tablets", value: 5000, category: "Product" },
  ],
  France: [
    { name: "Laptops", value: 10000, category: "Product" },
    { name: "Phones", value: 7000, category: "Product" },
    { name: "Tablets", value: 3000, category: "Product" },
  ],
  China: [
    { name: "Laptops", value: 40000, category: "Product" },
    { name: "Phones", value: 30000, category: "Product" },
    { name: "Tablets", value: 10000, category: "Product" },
  ],
  Japan: [
    { name: "Laptops", value: 25000, category: "Product" },
    { name: "Phones", value: 15000, category: "Product" },
    { name: "Tablets", value: 10000, category: "Product" },
  ],
  India: [
    { name: "Laptops", value: 10000, category: "Product" },
    { name: "Phones", value: 7000, category: "Product" },
    { name: "Tablets", value: 3000, category: "Product" },
  ],
};

router.get("/", (req, res) => {
  const { node } = req.query;

  try {
    let data;
    let title;
    
    if (!node || node === "root") {
      data = drilldownData["root"];
      title = "Global Sales by Region";
    } else if (drilldownData[node]) {
      data = drilldownData[node];
      title = `Sales Breakdown for ${node} (${data[0].category})`;
    } else {
      return res.status(404).json({ message: "No detailed data available for this segment." });
    }

    res.json({
      title,
      data,
    });
  } catch (error) {
    console.error("Drilldown Error:", error);
    res.status(500).json({ message: "Server error fetching drill-down data" });
  }
});

export default router;
