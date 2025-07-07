import './globals.css';
import { Inter } from 'next/font/google';
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/nextjs';


const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Audio File Transcriber',
  description: 'Convert your uploaded audio file into accurate text. One-time transcription service',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <header className="flex justify-end items-center p-4 gap-4 h-16">           
            <SignedOut>
              <SignInButton>
                <button className="bg-[#070708] hover:bg-gray-800 transition-all duration-200 transform hover:scale-105 text-white font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 rounded-md">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="bg-[#070708] hover:bg-gray-800 transition-all duration-200 transform hover:scale-105 text-white font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 rounded-md">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>          
            <SignedIn>            
              <UserButton/>
            </SignedIn>
          </header>

          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
