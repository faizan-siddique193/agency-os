import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";

interface TrialActivationEmailProps {
  userName?: string | null;
  workspaceName?: string;
  trialEndDate?: Date;
  dashboardLink?: string;
}

export const TrialActivationEmailTemplate = ({
  userName,
  workspaceName = "Acme Media",
  trialEndDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Default 14 days from now
  dashboardLink = "https://your-agencyos.com/dashboard",
}: TrialActivationEmailProps) => {
  const previewText = `Welcome to AgencyOS! Your 14-day free trial is active.`;

  // Format the date to look clean (e.g., "October 24, 2026")
  const formattedEndDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(trialEndDate);

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      {/* Custom Tailwind Config for Brand Unity */}
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                brand: {
                  primary: "#111827", // Replace with your exact primary hex
                  text: "#111827",
                  muted: "#6b7280",
                },
              },
            },
          },
        }}
      >
        <Body className="bg-[#f6f9fc] my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#e6ebf1] rounded-lg my-[40px] mx-auto p-[20px] max-w-[465px] bg-white shadow-sm">

            {/* Logo Section */}
            <Section className="mt-[32px]">
              <Text className="text-brand-primary text-[24px] font-bold text-center p-0 my-0">
                AgencyOS
              </Text>
            </Section>

            {/* Main Content */}
            <Heading className="text-brand-text text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Welcome to <strong>{workspaceName}</strong>
            </Heading>

            <Text className="text-[#374151] text-[14px] leading-[24px]">
              Hello {userName ? userName : "there"},
            </Text>

            <Text className="text-[#374151] text-[14px] leading-[24px]">
              Your workspace is ready. Your 14-day premium trial is now officially active, giving you full access to all enterprise features.
            </Text>

            <Section className="bg-gray-50 border border-gray-100 rounded-md p-4 my-[24px]">
              <Text className="text-[#374151] text-[14px] leading-[24px] m-0 font-medium text-center">
                Trial Ends: <span className="font-bold text-brand-primary">{formattedEndDate}</span>
              </Text>
            </Section>

            {/* CTA Button */}
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-brand-primary rounded-md text-white text-[14px] font-medium no-underline text-center px-6 py-3"
                href={dashboardLink}
              >
                Go to Dashboard
              </Button>
            </Section>

            <Text className="text-[#374151] text-[14px] leading-[24px]">
              You can start inviting team members, setting up projects, and exploring the platform immediately. We will send you a quick reminder before your trial expires.
            </Text>

            <Hr className="border border-solid border-[#e6ebf1] my-[26px] mx-0 w-full" />

            {/* Footer */}
            <Text className="text-brand-muted text-[12px] leading-[24px] text-center">
              If you need any help getting set up, simply reply to this email to reach our support team.
            </Text>
            <Text className="text-[#9ca3af] text-[12px] leading-[24px] text-center mt-2">
              © {new Date().getFullYear()} AgencyOS Inc. All rights reserved.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default TrialActivationEmailTemplate;