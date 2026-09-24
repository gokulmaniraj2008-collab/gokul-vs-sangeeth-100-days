const START = Date.UTC(2026, 8, 23);

const titles = [
  "Portfolio landing page","Responsive profile card","Calculator app","To-do list","Pomodoro timer","Digital clock","Unit converter","Quiz app","Markdown previewer","Form validator",
  "Weather dashboard","GitHub profile viewer","QR code generator","Password generator","Expense tracker","Habit tracker","Notes app","URL shortener UI","Color palette tool","Typing speed test",
  "AI text summarizer","AI study helper","AI resume helper","AI email writer","AI FAQ bot","AI quiz generator","AI flashcard maker","AI prompt library","AI idea generator","AI meeting notes",
  "CSV data viewer","Chart dashboard","Student marks analyzer","Attendance tracker","Inventory tracker","Sales dashboard","Budget planner","Data cleaning tool","JSON formatter","API testing client",
  "REST API starter","Auth demo","File upload service","Contact form backend","URL metadata API","Image resize API","Webhook receiver","Notification service","Rate limiter demo","API documentation site",
  "Mini blog CMS","Event registration app","Feedback platform","Survey builder","Poll app","Bookmark manager","Link-in-bio app","Recipe manager","Study planner","Job application tracker",
  "Mobile task app","Mobile notes app","Mobile expense app","Mobile habit app","Mobile weather app","Mobile QR scanner UI","Mobile study timer","Mobile inventory app","Mobile portfolio app","Mobile event app",
  "ESP32 sensor dashboard","Soil moisture monitor","Temperature monitor","Ultrasonic distance monitor","Servo controller","Relay controller","Smart irrigation dashboard","Robot status dashboard","IoT alerts panel","AGRIBOT control panel",
  "Farm price dashboard","Crop planning tool","Farm expense tracker","FPO member tracker","Buyer matching prototype","Freshness tracker","Market demand dashboard","Route planner","Farm inventory system","Agriculture analytics dashboard",
  "Mini SaaS landing page","SaaS admin dashboard","Subscription tracker","Team workspace","Feature flag dashboard","API key manager UI","Status page","Uptime monitor","Log viewer","Developer dashboard",
  "Mini-Replit","AI project planner","AI code explainer","GitHub issue helper","Deployment dashboard","Company metrics dashboard","Product launch page","Technical documentation hub","Personal developer OS","100-day showcase"
];

const skills = [
  "HTML/CSS & UI","Responsive CSS","JavaScript fundamentals","DOM & events","Productivity systems","JavaScript timing","Problem solving","JavaScript logic","Markdown & parsing","Forms & validation",
  "APIs & async JavaScript","GitHub API","Web utilities","Security basics","State & local storage","Data modeling","CRUD UI","URL handling","UI design","Browser APIs",
  "AI API integration","AI workflows","Prompt engineering","AI-assisted writing","RAG/FAQ concepts","AI generation","Study automation","Prompt design","Product ideation","AI note processing",
  "CSV processing","Data visualization","Data analysis","Forms & data","CRUD systems","Dashboard design","Finance logic","Data cleaning","JSON & parsing","API testing",
  "REST APIs","Authentication","File handling","Backend forms","Metadata APIs","Image processing","Webhooks","Notifications","Rate limiting","API documentation",
  "CMS architecture","Events & forms","Feedback systems","Survey logic","Poll systems","Bookmarks","Web app UX","CRUD architecture","Planning systems","Application tracking",
  "Mobile UX","Mobile data","Mobile finance","Mobile habits","Mobile APIs","Mobile scanning UI","Timers","Mobile CRUD","Mobile UI","Mobile events",
  "ESP32 basics","Sensors","DHT/temperature","Ultrasonic sensing","Servo control","Relays","IoT control","Automation","Robot telemetry","ESP32 robotics",
  "Agriculture data","Farm planning","Farm finance","FPO workflows","Matching logic","Freshness data","Demand analytics","Routing","Inventory","Agriculture analytics",
  "SaaS UI","Admin systems","Subscriptions","Team systems","Feature flags","Secrets & API keys","Status monitoring","Uptime monitoring","Logs","Developer tooling",
  "Full-stack systems","AI planning","Code understanding","GitHub automation","Deployment","Product analytics","Launch execution","Technical writing","Developer workflow","Project integration"
];


function businessFocus(d) {
  if (d <= 10) return "Portfolio + small service experiment: show today's build to one potential user and seek a real problem.";
  if (d <= 20) return "SaaS/client opportunity: turn today's feature into a reusable demo and contact one potential customer.";
  if (d <= 30) return "Backend/e-commerce opportunity: identify a business workflow that could be improved and document a sellable solution.";
  if (d <= 40) return "Automation/API service: find one repetitive business process that today's backend skill could automate.";
  if (d <= 50) return "AI product experiment: identify a real business use case, build a demo, and collect user feedback.";
  if (d <= 60) return "Data/ML opportunity: connect today's model or analytics skill to a measurable business problem.";
  if (d <= 70) return "AgriTech validation: test today's feature with farmer/FPO/buyer requirements; record assumptions and feedback.";
  if (d <= 80) return "IoT/robotics validation: connect today's hardware capability to a real agricultural problem and assess commercial feasibility.";
  if (d <= 90) return "Production + sales readiness: improve reliability, security, deployment, documentation, and customer delivery.";
  return "Product-company execution: validate, package, deploy, market, and measure the strongest product opportunity.";
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

  $("dayNumber").textContent = "DAY " + d;
  $("project").textContent = titles[d - 1];
  $("skill").textContent = skills[d - 1];
  $("business").textContent = businessFocus(d);
  $("completed").textContent = completed;
  $("current").textContent = d;
  $("remaining").textContent = Math.max(0, 100 - d) + " days remaining";
  $("progressBar").style.width = completed + "%";

  let streak = 0;
  for (let n = d; n >= 1; n--) {
    if (row(n)) streak++;
    else break;
  }
  $("streak").textContent = streak;
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
