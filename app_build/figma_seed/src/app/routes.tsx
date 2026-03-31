import { createBrowserRouter } from "react-router";
import { Landing } from "./pages/Landing";
import { Auth } from "./pages/Auth";
import { AuthCallback } from "./pages/AuthCallback";
import { TermsAndPrivacy } from "./pages/TermsAndPrivacy";
import { PublicPortfolio } from "./pages/PublicPortfolio";
import { PublicPortfolioV3 } from "./pages/PublicPortfolioV3";
import { PublicBooking } from "./pages/PublicBooking";
import { BookingResponse } from "./pages/BookingResponse";
import { StripeCallback } from "./pages/StripeCallback";
import { AppShell } from "./components/AppShell";
import { Home } from "./pages/app/Home";
import { Jobs } from "./pages/app/Jobs";
import { NewJob } from "./pages/app/NewJob";
import { EditJob } from "./pages/app/EditJob";
import { Portfolio } from "./pages/app/Portfolio";
import { PortfolioHome, PortfolioBuilder, ThemeStudio, PortfolioInsights, BlockEditor } from "./pages/app/portfolio";
import { Finance } from "./pages/app/Finance";
import { Clients } from "./pages/app/Clients";
import { Availability } from "./pages/app/Availability";
import { Settings } from "./pages/app/Settings";
import { TaxCentre } from "./pages/app/TaxCentre";
import { ConnectedCalendars } from "./pages/app/ConnectedCalendars";
import { Messages } from "./pages/app/Messages";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  { path: "/", Component: Landing },
  { path: "/auth", Component: Auth },
  { path: "/auth/callback", Component: AuthCallback },
  { path: "/terms-and-privacy", Component: TermsAndPrivacy },
  { path: "/booking-response", Component: BookingResponse },
  { path: "/stripe-callback", Component: StripeCallback },
  {
    path: "/app",
    Component: AppShell,
    children: [
      { path: "home", Component: Home },
      { path: "jobs", Component: Jobs },
      { path: "portfolio", Component: PortfolioHome },
      { path: "portfolio/builder", Component: PortfolioBuilder },
      { path: "portfolio/theme-studio", Component: ThemeStudio },
      { path: "portfolio/insights", Component: PortfolioInsights },
      { path: "portfolio/builder/edit/:blockId", Component: BlockEditor },
      { path: "finance", Component: Finance },
      { path: "clients", Component: Clients },
      { path: "availability", Component: Availability },
      { path: "settings", Component: Settings },
      { path: "tax-centre", Component: TaxCentre },
      { path: "connected-calendars", Component: ConnectedCalendars },
      { path: "messages", Component: Messages },
      { path: "jobs/new", Component: NewJob },
      { path: "jobs/:id/edit", Component: EditJob },
    ],
  },
  { path: "/:nickname/book", Component: PublicBooking },
  { path: "/:handle", Component: PublicPortfolioV3 },
  { path: "*", Component: NotFound },
]);