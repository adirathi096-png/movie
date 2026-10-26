# 🎬 IMovies — Movie Ticket Booking Made Simple

A full-stack, production-style cinema ticket booking platform built with the **MERN stack** (MongoDB, Express.js, React, Node.js), Vite, and Bootstrap 5. Features concurrency-safe seat reservation holds, real-time seat status maps, digital e-tickets with QR codes, demo checkout, ticket cancellations, and a central administration portal.

---

## 🌟 Key Features

### 🍿 Customer Movie Discovery & Booking
- **Cinematic Discovery Hero**: Dynamic billboard premiere banner with trailer modal preview and direct booking CTA.
- **Search & Filtering**: Live title/cast search, genre filtering pills, language filter, and sorting (IMDb Rating, Newest Release, Alphabetical) synced with URL query parameters.
- **Movie Details**: Full synopses, certificate ratings, duration, director, starring cast, and integrated showtime selector.
- **Multi-Cinema & Screen Listings**: Real-world cinema networks (Laser IMAX, Dolby Atmos, 4DX) across major cities (Mumbai, Bengaluru, Delhi NCR).
- **Interactive Cinema Seat Map**:
  - Curved glowing screen indicator (*Screen This Way*).
  - Multi-tier seat categories: **Standard Classic**, **Premium Prime**, and **VIP Recliner Lounges**.
  - Dynamic visual states: `Available`, `Selected`, `Temporarily Held by Another Customer`, and `Sold Out`.
  - Max seat limit enforcement (up to 10 seats per booking).
- **Concurrency-Safe Seat Reservation**:
  - Server-side atomic seat locking prevents double bookings.
  - 8-minute countdown hold timer with automatic status refresh upon expiration.
- **Itemized Pricing & Promo Code**: Live calculation of base ticket price, convenience fees, and 18% GST with optional promo code (`IMOVIES20`).
- **Simulated Checkout & Gateways**:
  - Instant 1-click test checkout mode for fast demonstration.
  - Sandbox modes for Credit/Debit Cards, UPI / QR, and Net Banking.
  - Confetti celebration animation upon ticket confirmation.
- **Digital E-Tickets**: Perforated ticket stub design with unique reference (`IMV-XXXXXX`), turnstile QR code, screen details, and Print/Save PDF support.
- **Ticket Wallet & Cancellations**: Filter bookings by status (`Confirmed` / `Cancelled`), view past tickets, and cancel eligible bookings (up to 2 hours before showtime) with calculated refunds and immediate seat inventory release.

### 🛡️ Administrative Portal
- **KPI Metrics Dashboard**: Live aggregate statistics for Net Revenue, Confirmed Tickets, Now Showing titles, and Registered Customers.
- **Movie Catalogue Management**: Modal form for adding, editing, and deleting movie records with poster/backdrop URLs and YouTube trailer embeds.
- **Multiplex & Screen Configuration**: Add cinema venues and screens with customizable auditorium seating formats.
- **Showtime Scheduler**: Collision detection engine preventing overlapping schedules on the same screen.
- **Global Booking Audit Log**: Search platform-wide bookings by reference code with manual cancellation override.
- **User Role Management**: Inspect customer accounts and toggle administrative privileges safely.

---

## 🏗️ System Architecture

```mermaid
graph TD
    Client["React Frontend (Vite + Bootstrap 5)"]
    API["Express.js REST API (/api/v1)"]
    Auth["JWT & bcrypt Authentication"]
    ResService["Concurrency-Safe Reservation Engine"]
    BookService["Atomic Booking & Cancellation Engine"]
    DB[("MongoDB Database")]

    Client -->|HTTP / Axios with JWT| API
    API --> Auth
    API --> ResService
    API --> BookService
    ResService -->|Atomic Holds & TTL Expiry| DB
    BookService -->|Inventory Locking & Refunds| DB
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 6, Bootstrap 5, Lucide React, React Router 7, Axios, Canvas Confetti |
| **Backend** | Node.js 24+, Express.js 4, Mongoose 8, JWT, bcryptjs, Helmet, CORS, Morgan |
| **Database** | MongoDB (Production) with zero-setup In-Memory MongoDB fallback |
| **Testing** | Vitest, React Testing Library, Jest, Supertest |

---

## 📁 Project Structure

```
movie/
├── package.json               # Root scripts orchestrator
├── README.md                  # Comprehensive documentation
├── .gitignore                 # Standard Git ignore rules
│
├── server/                    # Node.js + Express Backend
│   ├── package.json
│   ├── .env.example
│   ├── .env
│   ├── src/
│   │   ├── config/db.js       # Smart DB connection (Atlas / Local / Memory fallback)
│   │   ├── models/            # User, Movie, Cinema, Screen, Showtime, Booking, SeatReservation
│   │   ├── controllers/       # Auth, Movie, Cinema, Showtime, Reservation, Booking, Admin
│   │   ├── routes/            # REST API endpoints under /api/v1
│   │   ├── middleware/        # JWT verify, requireAdmin, errorHandler, rateLimiter, validate
│   │   ├── services/          # reservationService, bookingService
│   │   ├── utils/seedData.js  # Rich demonstration seed script
│   │   ├── app.js             # Express app setup
│   │   └── server.js          # Server entry point
│   └── tests/                 # Jest & Supertest API & concurrency tests
│
└── client/                    # React + Vite Frontend
    ├── package.json
    ├── vite.config.js
    ├── index.html
    ├── src/
    │   ├── components/        # Navbar, Footer, MovieCard, MovieGrid, MovieHero, SeatMap, TicketCard...
    │   ├── context/           # AuthContext, BookingContext, ToastContext
    │   ├── pages/             # Home, NowShowing, Upcoming, MovieDetails, SeatSelection, Checkout...
    │   ├── services/api.js    # Axios client with interceptors
    │   ├── styles/index.css   # Modern dark cinematic theme & glassmorphic styles
    │   ├── App.jsx            # Router and layout configuration
    │   └── main.jsx
    └── tests/                 # Vitest & React Testing Library component tests
```

---

## ⚡ Quick Start & Run Commands

### 1. Install Dependencies
```bash
# From the project root
npm run install:all
```

### 2. Seed Initial Demonstration Data
```bash
npm run seed
```
*Seeds 7 premiere movies, 3 cinema multiplexes, 6 auditorium screens with 76 tiered seats each, 120 future showtimes, and default demo accounts.*

### 3. Start Development Servers
```bash
npm run dev
```
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api/v1](http://localhost:5000/api/v1)
- **Health Check**: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)

---

## 🔑 Demonstration Accounts

The platform includes convenient 1-click **"Fill Demo User"** and **"Fill Demo Admin"** buttons on the Login page:

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@imovies.com` | `Admin@12345` |
| **Demo Customer** | `user@imovies.com` | `User@12345` |

---

## 🧪 Automated Testing

Both the backend and frontend have comprehensive test suites verifying critical functionality:

### Run Backend Tests (Jest & Supertest)
```bash
npm run test:server
```
**Tests Covered (12/12 Passing)**:
- User registration and email uniqueness enforcement.
- Credential validation and JWT session issuance.
- Profile retrieval and unauthorized rejection.
- Concurrency-safe seat reservation holds.
- **Seat Conflict Prevention**: Two users attempting to hold the same seat receives `409 Conflict`.
- Atomic booking confirmation and inventory locking.
- Booking cancellation and automatic seat release back to inventory.

### Run Frontend Tests (Vitest & RTL)
```bash
npm run test:client
```
**Tests Covered (5/5 Passing)**:
- `MovieCard`: Title, rating, certification, and duration formatting.
- `SeatMap`: Curved screen layout, tier rendering, selection callbacks, and disabled states for booked/held seats.
- `TicketCard`: Reference code, movie details, seats, price breakdown, and total.

---

## 🚀 Production Deployment on Vercel

IMovies is designed with a full-stack monorepo architecture. Vercel detects both the frontend (`client/`) and backend (`server/`). 

### Recommended Architecture: Two Vercel Projects
For maximum stability, isolation, and standard Vite/Express serverless support, deploy as **two projects in the same Vercel team/account connected to the same GitHub repository**:
1. **Backend Project**: `imovies-api` (Root Directory: `server`)
2. **Frontend Project**: `imovies-web` (Root Directory: `client`)

*(Note: A single-project fallback configuration is also supported via root `vercel.json` and `api/index.js` if you prefer unified routing).*

---

### Step 1: Push Code to GitHub
Ensure all code and configuration files are committed and pushed to your GitHub repository:
```bash
git add .
git commit -m "feat(deploy): full-stack vercel deployment configuration"
git push origin main
```
Repository: `https://github.com/adirathi096-png/movie`

---

### Step 2: Configure MongoDB Atlas (Production Database)
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. **Create a Database User**:
   - Go to **Security** → **Database Access** → **Add New Database User**.
   - Authentication Method: **Password**.
   - Database User Privileges: **Read and write to any database**.
   - Note the username and password (avoid special characters like `@` or `:` in the password, or URL-encode them).
3. **Configure Network Access**:
   - Go to **Security** → **Network Access** → **Add IP Address**.
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`).
   > [!NOTE]
   > Vercel Serverless Functions execute on dynamic IP pools across AWS regions and do not have fixed outbound IP addresses. Therefore, `0.0.0.0/0` is required unless you use MongoDB Atlas VPC Peering or an AWS PrivateLink gateway. Atlas protects access via strong SCRAM password authentication and TLS/SSL encryption.
4. **Obtain Connection String**:
   - Go to **Database** → **Connect** → **Drivers** (Node.js).
   - Copy the URI:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/imovies?retryWrites=true&w=majority
     ```

---

### Step 3: Deploy the Backend API (`imovies-api`)
1. In your [Vercel Dashboard](https://vercel.com/dashboard), click **"Add New..."** → **"Project"**.
2. Select your repository `adirathi096-png/movie` and click **Import**.
3. **Configure Project Settings**:
   - **Project Name**: `imovies-api` (or your preferred name)
   - **Framework Preset**: Select **Other**
   - **Root Directory**: Click *Edit* and select **`server`**
4. **Build and Output Settings**:
   - Build Command: Leave blank / default
   - Output Directory: Leave blank / default
   - Install Command: `npm install`
5. **Environment Variables**:
   Add the following variables under the **Production**, **Preview**, and **Development** tabs:

   | Variable Name | Example / Recommended Value | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production optimizations and disables in-memory DB |
   | `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/imovies?retryWrites=true&w=majority` | Your MongoDB Atlas connection URI |
   | `JWT_SECRET` | `c3a8e9f2d1b0...` *(generate 64 random characters)* | Token signing secret |
   | `JWT_EXPIRES_IN` | `7d` | Token validity period |
   | `HOLD_EXPIRY_MINUTES` | `8` | Temporary seat hold reservation lifetime |
   | `CLIENT_URL` | `https://your-frontend-project.vercel.app` *(update after Step 4)* | Allowed CORS origin for the frontend |

6. Click **Deploy**.
7. Once deployed, note your backend URL (e.g. `https://imovies-api-adirathi.vercel.app`).
8. Verify readiness by opening `https://<backend-url>/api/v1/health` in your browser. You should receive:
   ```json
   { "success": true, "message": "IMovies API is healthy", "database": "connected" }
   ```

---

### Step 4: Deploy the Frontend (`imovies-web`)
1. In your [Vercel Dashboard](https://vercel.com/dashboard), click **"Add New..."** → **"Project"**.
2. Import the same repository `adirathi096-png/movie`.
3. **Configure Project Settings**:
   - **Project Name**: `imovies-web`
   - **Framework Preset**: **Vite**
   - **Root Directory**: Click *Edit* and select **`client`**
4. **Build and Output Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. **Environment Variables**:
   Add the following under **Production**, **Preview**, and **Development**:

   | Variable Name | Value | Description |
   |---|---|---|
   | `VITE_API_BASE_URL` | `https://<your-backend-url>.vercel.app/api/v1` | URL of the deployed backend with `/api/v1` suffix |

6. Click **Deploy**.
7. Note your frontend production URL (e.g. `https://imovies-web-adirathi.vercel.app`).

---

### Step 5: Link Frontend URL in Backend CORS
1. Return to your **`imovies-api`** project in the Vercel Dashboard.
2. Go to **Settings** → **Environment Variables**.
3. Edit `CLIENT_URL` and set its value to your actual frontend domain:
   ```env
   CLIENT_URL=https://imovies-web-adirathi.vercel.app
   ```
   *(If you have a custom domain, add it comma-separated, e.g. `https://imovies-web.vercel.app,https://mycustomdomain.com`).*
4. Go to **Deployments** → click the three dots `...` on the latest deployment → click **Redeploy** to apply the updated environment variable.

---

### Step 6: Seed Initial Movies & Showtimes to MongoDB Atlas
To populate your production Atlas database with the initial movies, cinemas, screens, and showtimes:
```bash
# Run from your local terminal with MONGODB_URI set to your Atlas cluster:
MONGODB_URI="mongodb+srv://<user>:<password>@cluster.mongodb.net/imovies?retryWrites=true&w=majority" npm run seed
```
All 7 premiere films, 3 multiplexes, auditorium seats, and future showtimes will immediately appear on your live site!

---

### Step 7: Redeployment & Continuous Deployment
Vercel automatically triggers new builds whenever you push to your GitHub `main` branch.
- Any frontend code change under `client/` will trigger a rebuild of `imovies-web`.
- Any backend code change under `server/` will trigger an instant serverless function update for `imovies-api`.
- When updating environment variables, remember to trigger a **Redeploy** from the Vercel dashboard.

---

### 🛠️ Troubleshooting Common Deployment Errors

| Issue | Cause | Solution |
|---|---|---|
| **CORS Origin Not Allowed** | `CLIENT_URL` in backend project does not match frontend domain | Check browser console. Ensure `CLIENT_URL` in `imovies-api` matches `https://<frontend>.vercel.app` exactly (no trailing slash). Redeploy backend after updating. |
| **500 Server Error on API requests** | Missing or incorrect `MONGODB_URI` | Verify `MONGODB_URI` in `imovies-api` environment variables. Check Atlas Network Access has `0.0.0.0/0` allowed. |
| **404 on Page Refresh (e.g. `/movie/dune-part-two`)** | Missing SPA rewrite rule | Handled automatically by `client/vercel.json` rewrites `/(.*)` → `/index.html`. |
| **API returns 404** | Incorrect route path prefix | Ensure `VITE_API_BASE_URL` ends with `/api/v1` (e.g. `https://imovies-api.vercel.app/api/v1`). |
| **Mixed Content Warning** | Frontend requested HTTP rather than HTTPS | Ensure all environment variables specify `https://` instead of `http://`. |
| **504 Gateway Timeout on first call** | Cold start / Mongoose reconnect delay | Our cached connection in `server/src/config/db.js` reuses warm connections (`readyState === 1`) and sets `serverSelectionTimeoutMS: 8000` to prevent lambda timeouts. |

---

## 📄 License
MIT © IMovies Team. Designed for high-reliability cinema ticket booking.

