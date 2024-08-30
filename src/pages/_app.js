import React from "react";
import Navbar from "./../components/Navbar";
import IndexPage from "./index";
import AboutPage from "./about";
import FaqPage from "./faq";
import ContactPage from "./contact";
import PricingPage from "./pricing";
import DashboardPage from "./dashboard";
import AuthPage from "./auth";
import SettingsPage from "./settings";
import LegalPage from "./legal";
import { Switch, Route, Router } from "./../util/router";
import PurchasePage from "./purchase";
import FirebaseActionPage from "./firebase-action";
import NotFoundPage from "./404";
import Footer from "./../components/Footer";
import "./../util/analytics";
import Chat from "./../components/Chat";
import { AuthProvider } from "./../util/auth";
import { ThemeProvider } from "./../util/theme";
import { QueryClientProvider } from "./../util/db";

function App(props) {
  return (
    <QueryClientProvider>
      <ThemeProvider>
        <AuthProvider>
          <Chat />
          <Router>
            <>
              <Navbar
                color="default"
                logo="/logo.png"
                logoInverted="/logo_inverted.png"
              />

              <Switch>
                <Route exact path="/" component={IndexPage} />

                <Route exact path="/about" component={AboutPage} />

                <Route exact path="/faq" component={FaqPage} />

                <Route exact path="/contact" component={ContactPage} />

                <Route exact path="/pricing" component={PricingPage} />

                <Route exact path="/dashboard" component={DashboardPage} />

                <Route exact path="/auth/:type" component={AuthPage} />

                <Route
                  exact
                  path="/settings/:section"
                  component={SettingsPage}
                />

                <Route exact path="/legal/:section" component={LegalPage} />

                <Route exact path="/purchase/:plan" component={PurchasePage} />

                <Route
                  exact
                  path="/firebase-action"
                  component={FirebaseActionPage}
                />

                <Route component={NotFoundPage} />
              </Switch>

              <Footer
                bgColor="default"
                size="medium"
                bgImage=""
                bgImageOpacity={1}
                description="Send important messages when the time is right."
                copyright={`© ${new Date().getFullYear()} Lenny's App`}
                logo="/logo.png"
                logoInverted="/logo_inverted.png"
                sticky={true}
              />
            </>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
