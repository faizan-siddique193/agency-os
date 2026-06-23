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

interface TeamInviteEmailProps {
  inviterName?: string | null;
  inviterEmail?: string;
  workspaceName?: string;
  inviteLink?: string;
}

export const InviteTeamMemberEmailTemplate = ({
  inviterName,
  inviterEmail = "hello@agencyos.com",
  workspaceName = "Acme Media",
  inviteLink = "https://your-agencyos.com/invite/magic-link-123",
}: TeamInviteEmailProps) => {
  const previewText = `Join ${workspaceName} on AgencyOS`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-[#f6f9fc] my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#e6ebf1] rounded-lg my-[40px] mx-auto p-[20px] max-w-[465px] bg-white shadow-sm">

            {/* Logo Section */}
            <Section className="mt-[32px]">
              <Text className="text-[#111827] text-[24px] font-bold text-center p-0 my-0">
                AgencyOS
              </Text>
            </Section>

            {/* Main Content */}
            <Heading className="text-[#111827] text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Join <strong>{workspaceName}</strong>
            </Heading>

            <Text className="text-[#374151] text-[14px] leading-[24px]">
              Hello,
            </Text>

            {/* Dynamic Greeting Logic */}
            <Text className="text-[#374151] text-[14px] leading-[24px]">
              {inviterName ? (
                <>
                  <strong>{inviterName}</strong> (
                  <Link href={`mailto:${inviterEmail}`} className="text-[#2563eb] no-underline">
                    {inviterEmail}
                  </Link>
                  ) has invited you to collaborate with them in the <strong>{workspaceName}</strong> workspace on AgencyOS.
                </>
              ) : (
                <>
                  You have been invited by{" "}
                  <Link href={`mailto:${inviterEmail}`} className="text-[#2563eb] no-underline">
                    {inviterEmail}
                  </Link>{" "}
                  to collaborate in the <strong>{workspaceName}</strong> workspace on AgencyOS.
                </>
              )}
            </Text>

            {/* CTA Button */}
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-[#111827] rounded-md text-white text-[14px] font-medium no-underline text-center px-6 py-3"
                href={inviteLink}
              >
                Accept Invitation
              </Button>
            </Section>

            <Text className="text-[#374151] text-[14px] leading-[24px]">
              Or copy and paste this URL into your browser:{" "}
              <Link
                href={inviteLink}
                className="text-[#2563eb] no-underline"
              >
                {inviteLink}
              </Link>
            </Text>

            <Hr className="border border-solid border-[#e6ebf1] my-[26px] mx-0 w-full" />

            {/* Footer */}
            <Text className="text-[#6b7280] text-[12px] leading-[24px] text-center">
              This invitation was intended for you. If you were not expecting this invitation, you can safely ignore this email.
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

export default InviteTeamMemberEmailTemplate;