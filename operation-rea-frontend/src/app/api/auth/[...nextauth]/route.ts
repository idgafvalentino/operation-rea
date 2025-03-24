import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";

// Add more detailed debug logs to check environment variables
console.log("NextAuth Environment Check:");
console.log("- GITHUB_ID exists:", !!process.env.GITHUB_ID);
console.log("- GITHUB_SECRET exists:", !!process.env.GITHUB_SECRET);
console.log("- NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("- NEXTAUTH_SECRET exists:", !!process.env.NEXTAUTH_SECRET);

const handler = NextAuth({
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID || "",
            clientSecret: process.env.GITHUB_SECRET || "",
        }),
    ],
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: true,
    callbacks: {
        // Log session lifecycle events
        async session({ session, token }) {
            console.log("Session callback called", { sessionExists: !!session });
            return session;
        },
        async jwt({ token, account }) {
            console.log("JWT callback called", { tokenExists: !!token });
            return token;
        }
    }
});

export { handler as GET, handler as POST }; 