import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="flex flex-col items-center justify-center space-y-8 p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Risk Analytics Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Comprehensive portfolio risk analytics and compliance management
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
          <Link
            href="/portfolio"
            className="financial-card w-64 h-32 flex flex-col items-center justify-center text-center hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white border border-gray-200 rounded-lg p-6"
          >
            <div className="text-3xl mb-2">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Portfolio</h3>
            <p className="text-sm text-gray-600">Manage your investments</p>
          </Link>

          <Link
            href="/reporting"
            className="financial-card w-64 h-32 flex flex-col items-center justify-center text-center hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white border border-gray-200 rounded-lg p-6"
          >
            <div className="text-3xl mb-2">📈</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Reporting</h3>
            <p className="text-sm text-gray-600">View analytics & reports</p>
          </Link>

          <Link
            href="/compliance"
            className="financial-card w-64 h-32 flex flex-col items-center justify-center text-center hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white border border-gray-200 rounded-lg p-6"
          >
            <div className="text-3xl mb-2">✅</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Compliance</h3>
            <p className="text-sm text-gray-600">Regulatory compliance</p>
          </Link>
        </div>
      </main>
      {/* <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left">
          <li className="mb-2 tracking-[-.01em]">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-1 py-0.5 rounded">
              src/app/page.tsx
            </code>
            .
          </li>
          <li className="tracking-[-.01em]">
            Save and see your changes instantly.
          </li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer> */}
    </div>
  );
}
