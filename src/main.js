const START = Date.UTC(2026, 8, 23);

const titles = ["Personal Dashboard","Responsive Profile Card","Expense Tracker","Smart Form","Search & Filter App","Analytics Dashboard","Drag & Drop Board","Weather/API App","Authentication UI","Mini-Replit","React Component System","Product Catalogue UI","Cart Application","Form + Validation","API-Powered App","Next.js Application","Server/Client Architecture","Authentication System","Protected Dashboard","Mini SaaS Product","SQL Laboratory","Relational Data Model","Prisma Application","Authentication API","Role-Based API","E-Commerce Backend Audit","Inventory Transaction System","Payment Integration Design","API Validation + Testing","Production E-Commerce V2","FastAPI Fundamentals","REST API","Authentication Service","File Upload Service","Notification Service","Webhook System","Rate Limiting","API Testing","Logging + Error System","Production API Service","LLM API App","Structured AI Output","Prompt Engineering","Embeddings","Vector Database","RAG Application","Tool Calling","AI Agent","AI Evaluation System","AI Research Assistant","Python Data Pipeline","Data Cleaning","Data Visualization","Statistics","Regression","Classification","Model Evaluation","Feature Engineering","Prediction API","Agricultural Demand Prediction","Crop Data System","Market-Price Service","Demand Forecasting","Production Recommendation","Selling-Window Prediction","Buyer Matching","FPO Aggregation","Logistics Optimizer","Farmer Dashboard","Mini Farm Intelligence Platform","ESP32 Fundamentals","Sensor System","Motor Controller","Relay/Pump System","Serial Debugging","ESP32 Wi-Fi","HTTP/MQTT Telemetry","Device Authentication","Cloud Commands","Cloud Agricultural Robot","Unit Testing","Integration Testing","API Security","Database Security","Docker","CI/CD","Logging + Monitoring","Performance Engineering","Deployment","Production Readiness Audit","Product Architecture","Multi-Product Architecture","Shared Authentication","Shared Database/Services","Product Implementation","Core Business Logic","Testing","Security","Deployment + Documentation","Farm Intelligence Product Suite"];

const skills = ["HTML/CSS/JS","Responsive CSS","JavaScript state","Form validation","DOM/data handling","Charts","Browser APIs","REST APIs","Auth UX","Full frontend integration","React architecture","Reusable components","Commerce UI","Validation","API integration","Next.js","Server/client design","Authentication","Authorization","SaaS architecture","PostgreSQL","Database design","Prisma ORM","Auth APIs","Authorization","Real backend analysis","Transactions","Payment architecture","Zod + testing","Production DB design","FastAPI","REST architecture","Auth service design","File handling","Notifications","Webhooks","Rate limiting","API testing","Observability","Production APIs","LLM APIs","Structured outputs","Prompt engineering","Embeddings","Vector search","RAG","Tool calling","Agents","Evaluation","AI applications","Python pipelines","Data cleaning","Visualization","Statistics","Regression","Classification","Model evaluation","Feature engineering","Prediction APIs","Agricultural ML","Crop data","Market data","Forecasting","Decision support","Selling windows","Matching","FPO workflows","Route optimization","Farmer UX","AgriTech architecture","ESP32","Sensors","Motor control","Relays/pumps","Debugging","Wi-Fi","Telemetry","Device security","Cloud commands","IoT robotics","Unit testing","Integration testing","API security","Database security","Docker","CI/CD","Monitoring","Performance","Cloud deployment","Production audit","Product architecture","Platform architecture","Shared auth","Shared services","Product development","Business logic","Quality engineering","Security engineering","Documentation","Product company engineering"];

const businessPhases = ["Portfolio + small service experiment","React/SaaS client opportunity","Backend/e-commerce business solution","Automation/API service","AI product experiment","Data/ML business problem","AgriTech customer validation","IoT/robotics commercial validation","Production + sales readiness","Product-company execution"];


function businessFocus(d) {
  return businessPhases[Math.min(9, Math.floor((d - 1) / 10))];
}

const $ = (id) => document.getElementById(id);

function ist() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
}

function dayNo() {
  const n = ist();
  return Math.max(1, Math.min(100, Math.floor(
    (Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()) - START) / 86400000
  ) + 1));
}

function row(n) {
  try {
    return JSON.parse(localStorage.getItem("challenge-day-" + n) || "null");
  } catch {
    return null;
  }
}

function render() {
  const d = dayNo();
  const completed = Array.from({ length: 100 }, (_, i) => row(i + 1)).filter(Boolean).length;
  const earned = Array.from({ length: 100 }, (_, i) => row(i + 1)).filter(Boolean).reduce((sum, x) => sum + Number(x?.revenue || 0), 0);

  $("dayNumber").textContent = "DAY " + d;
  $("project").textContent = titles[d - 1];
  $("skill").textContent = skills[d - 1];
  $("business").textContent = businessFocus(d);
  $("completed").textContent = completed;
  $("current").textContent = d;
  $("remaining").textContent = Math.max(0, 100 - d) + " days remaining";
  const pct = Math.max(0, Math.min(100, d));
  const tf = $("timelineFill"), td = $("timelineDot");
  if (tf) tf.style.width = pct + "%";
  if (td) td.style.left = pct + "%";
  const tl = $("timelineLabel");
  if (tl) tl.textContent = "DAY " + d + " / 100";
  $("progressBar").style.width = completed + "%";

  let streak = 0;
  for (let n = d; n >= 1; n--) {
    if (row(n)) streak++;
    else break;
  }
  $("streak").textContent = streak;
  const income = document.getElementById("income");
  if (income) income.textContent = "₹" + earned.toLocaleString("en-IN");
  $("dayDate").textContent = ist().toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric"
  }).toUpperCase();
}

function clock() {
  const n = new Date();
  $("clock").textContent = n.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit",
    second: "2-digit", hour12: true
  });
  $("date").textContent = n.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata", weekday: "short", day: "2-digit",
    month: "short", year: "numeric"
  });
}

render();
clock();
setInterval(clock, 1000);
