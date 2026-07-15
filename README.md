# Seolyze - AI-Powered SEO Analysis & Rank Tracking

Seolyze is a comprehensive, full-stack application designed to help you analyze, track, and improve your website's search engine optimization (SEO) performance. Built with a modern glassmorphism UI and powered by Google's Gemini AI, Seolyze provides actionable insights to boost your website's rankings.

## 🌟 Key Features

- **Instant AI SEO Audits:** Get comprehensive insights into your website's SEO performance using Google Gemini.
- **Deep Performance Metrics:** Analyze load times, Core Web Vitals, and page sizes.
- **Keyword Tracking & Density Analysis:** Discover and monitor the most relevant keywords for your niche.
- **Actionable Recommendations:** Receive step-by-step guidance on how to fix critical and warning-level issues.
- **Automated Rank Tracking:** Automatically track your website's position on search engines over time.
- **History & Reports:** Keep a log of past analyses and compare your SEO score progression.

## 🛠 Tech Stack

### Frontend (Client)
- **Framework:** React 19 + Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4 with a sleek Glassmorphism design
- **Routing:** React Router DOM
- **Icons:** Lucide React

### Backend (Server)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose)
- **AI Integration:** Google GenAI (Gemini SDK)
- **Web Scraping:** BrowserBase & Playwright
- **Authentication:** JWT & bcrypt
- **Task Scheduling:** node-cron

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB instance (local or Atlas)
- Google Gemini API Key
- BrowserBase API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/krish23062005/Seolyze.git
   cd Seolyze
   ```

2. **Setup the Backend:**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory with the following variables:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key
   BROWSERBASE_API_KEY=your_browserbase_api_key
   BROWSERBASE_PROJECT_ID=your_browserbase_project_id
   ```

3. **Setup the Frontend:**
   ```bash
   cd ../client
   npm install
   ```
   Create a `.env` file in the `client` directory:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

### Running the Application

1. **Start the Backend Server:**
   ```bash
   cd server
   npm run start
   ```

2. **Start the Frontend Development Server:**
   ```bash
   cd client
   npm run dev
   ```

The application will now be available at `http://localhost:5173`.

## 🤝 Contributing

Contributions are always welcome! Please feel free to open a pull request or submit an issue if you encounter any bugs or have feature requests.

## 📝 License

This project is licensed under the MIT License.