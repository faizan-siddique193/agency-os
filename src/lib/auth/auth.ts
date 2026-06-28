import { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { Resend } from "resend";
import { MagicLinkEmail } from "@/email/MagicLink";

// resend client instance for sending verification emails
const resend = new Resend(process.env.RESEND_API_KEY);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    // 1. Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      // This allows NextAuth to safely merge a Google login with an existing Magic Link account
      allowDangerousEmailAccountLinking: true,
    }),

    // 2. Magic Link Provider
    EmailProvider({
      sendVerificationRequest: async ({ identifier, url }) => {
        try {
          const { host } = new URL(url);
          await resend.emails.send({
            from: "AgencyOS <onboarding@resend.dev>",
            to: identifier,
            subject: `Log in to ${host}`,
            react: MagicLinkEmail({ url, host }),
          });
        } catch (error) {
          console.error("Failed to send verification email.", error);
          throw new Error("Failed to send verification email.");
        }
      },
    }),
  ],

  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        (session.user as typeof session.user & { id: string }).id = user.id;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    verifyRequest: "/login/verify",
  },
};
