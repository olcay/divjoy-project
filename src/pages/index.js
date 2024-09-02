import React from "react";
import Meta from "./../components/Meta";
import HeroSection from "./../components/HeroSection";
import FeaturesSection from "./../components/FeaturesSection";
//import ClientsSection from "./../components/ClientsSection";
import TestimonialsSection from "./../components/TestimonialsSection";
//import NewsletterSection from "./../components/NewsletterSection";
import CtaSection from "./../components/CtaSection";
import StatsSection from "./../components/StatsSection";

function IndexPage(props) {
  return (
    <>
      <Meta />
      <HeroSection
        bgColor="primary"
        size="large"
        bgImage="https://images.unsplash.com/photo-1560863185-a4f6199b5768?auto=format&fit=crop&w=1600&h=800&q=80"
        bgImageOpacity={0.3}
        title="Send important messages when the time is right!"
        subtitle="Whether it’s a heartfelt letter or crucial information, Lenny's app ensures your words are delivered, even if you can’t be there to send them yourself."
        buttonText="Get Started"
        buttonColor="default"
        buttonPath="/pricing"
      />
      <FeaturesSection
        bgColor="default"
        size="medium"
        bgImage=""
        bgImageOpacity={1}
        title="Steps"
        subtitle="All the steps you need to secure your message"
      />
      {/* <ClientsSection
        bgColor="light"
        size="medium"
        bgImage=""
        bgImageOpacity={1}
        title="You're in good company"
        subtitle=""
      /> */}
      <StatsSection
        bgColor="light"
        size="medium"
        bgImage=""
        bgImageOpacity={1}
      />
      <TestimonialsSection
        bgColor="default"
        size="medium"
        bgImage=""
        bgImageOpacity={1}
        title="Here's what people are saying"
        subtitle=""
      />
      {/* <NewsletterSection
        bgColor="light"
        size="medium"
        bgImage=""
        bgImageOpacity={1}
        title="Stay in the know"
        subtitle="Receive our latest articles and feature updates"
        buttonText="Subscribe"
        buttonColor="primary"
        inputPlaceholder="Enter your email"
        subscribedMessage="You are now subscribed!"
      /> */}
      <CtaSection
        bgColor="primary"
        size="medium"
        bgImage=""
        bgImageOpacity={1}
        title="Ready to get started?"
        subtitle=""
        buttonText="Get Started"
        buttonColor="default"
        buttonPath="/pricing"
      />
    </>
  );
}

export default IndexPage;
