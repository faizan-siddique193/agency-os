import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Tailwind,
} from "react-email";

interface MagicLinkEmailProps {
  url: string;
  host: string;
}

export const MagicLinkEmail = ({ url, host }: MagicLinkEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Log in to {host}</Preview>
      <Tailwind>
        <Body className="bg-white font-sans">
          <Container className="mx-auto py-10 px-4 max-w-xl">
            <Heading className="text-2xl font-bold text-gray-900 mb-6">
              Welcome to {host}
            </Heading>
            <Text className="text-gray-700 text-base mb-6">
              Click the secure link below to log in to your workspace. This link
              expires in 24 hours and can only be used once.
            </Text>
            <Link
              href={url}
              className="bg-black text-white font-semibold py-3 px-6 rounded-md text-center block w-full mb-6 no-underline"
            >
              Log in to your account
            </Link>
            <Text className="text-gray-500 text-sm">
              If you did not request this email, you can safely ignore it.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default MagicLinkEmail;
