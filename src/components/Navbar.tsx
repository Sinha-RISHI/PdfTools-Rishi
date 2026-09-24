import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

export default async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#090a0f]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 via-red-600 to-indigo-600 text-white shadow-lg shadow-rose-900/30">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                />
              </svg>
            </div>
            <span className="text-base font-bold tracking-tight text-white sm:text-lg">
              PDFTools
            </span>
          </Link>

          <span className="hidden rounded border border-slate-700/80 bg-slate-800/80 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-300 md:inline-block">
            NEXT
          </span>

          <div className="hidden items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-950/40 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400 sm:inline-flex">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            <span>In-Memory Engine Active</span>
          </div>
        </div>

        {/* Center navigation */}
        <nav className="hidden items-center gap-6 lg:flex">
          <div className="group relative">
            <button
              type="button"
              className="flex items-center gap-1 text-xs font-medium text-slate-300 transition-colors hover:text-white"
            >
              <span>Tools</span>
              <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            <div className="invisible absolute -left-4 top-full mt-2 w-64 rounded-xl border border-slate-800 bg-[#0d0f17] p-2 opacity-0 shadow-2xl transition-all duration-200 group-hover:visible group-hover:opacity-100">
              <Link
                href="/tools/merge"
                className="flex items-center gap-2.5 rounded-lg p-2 text-xs text-slate-300 hover:bg-slate-800/80 hover:text-white"
              >
                <div className="h-2 w-2 rounded-full bg-indigo-500" />
                <div>
                  <div className="font-semibold">Merge PDF</div>
                  <div className="text-[10px] text-slate-500">Combine multiple documents</div>
                </div>
              </Link>
              <Link
                href="/tools/split"
                className="flex items-center gap-2.5 rounded-lg p-2 text-xs text-slate-300 hover:bg-slate-800/80 hover:text-white"
              >
                <div className="h-2 w-2 rounded-full bg-rose-500" />
                <div>
                  <div className="font-semibold">Split & Extract</div>
                  <div className="text-[10px] text-slate-500">Separate pages or ranges to ZIP</div>
                </div>
              </Link>
              <Link
                href="/tools/rotate"
                className="flex items-center gap-2.5 rounded-lg p-2 text-xs text-slate-300 hover:bg-slate-800/80 hover:text-white"
              >
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <div>
                  <div className="font-semibold">Rotate Pages</div>
                  <div className="text-[10px] text-slate-500">Change 90/180/270 degree orientation</div>
                </div>
              </Link>
              <Link
                href="/tools/watermark"
                className="flex items-center gap-2.5 rounded-lg p-2 text-xs text-slate-300 hover:bg-slate-800/80 hover:text-white"
              >
                <div className="h-2 w-2 rounded-full bg-sky-500" />
                <div>
                  <div className="font-semibold">Watermark PDF</div>
                  <div className="text-[10px] text-slate-500">Stamp confidential text overlays</div>
                </div>
              </Link>
            </div>
          </div>

          <a
            href="#architecture"
            className="text-xs font-medium text-slate-300 transition-colors hover:text-white"
          >
            Security & Architecture
          </a>
          <a
            href="#roadmap"
            className="text-xs font-medium text-slate-300 transition-colors hover:text-white"
          >
            Roadmap
          </a>
          <a
            href="#benchmarks"
            className="text-xs font-medium text-slate-300 transition-colors hover:text-white"
          >
            Benchmarks
          </a>
          {session && (
            <Link
              href="/dashboard"
              className="text-xs font-medium text-indigo-400 transition-colors hover:text-indigo-300"
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Right side Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/tools/merge"
            className="hidden items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-600/20 px-3 py-1.5 text-xs font-semibold text-indigo-300 shadow-sm transition-all hover:border-indigo-500/50 hover:bg-indigo-600/30 hover:text-white sm:flex"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
            <span>Upload PDF</span>
          </Link>

          {session ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-200 hover:border-indigo-500/50"
                title={session.user.name || "User"}
              >
                {(session.user.name || "U").charAt(0).toUpperCase()}
              </Link>
              <LogoutButton className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-slate-200" />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:text-white"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 shadow transition-colors hover:bg-slate-200"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
