import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";
import ToolsGrid from "@/components/ToolsGrid";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-full bg-slate-50">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-sm">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            <span className="text-lg font-semibold tracking-tight text-slate-900">
              PDFTools
            </span>
          </Link>
          <LogoutButton />
        </div>
      </header>

      <main className="px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Welcome back, {session.user.name ?? "there"}!
            </h1>
            <p className="mt-2 text-slate-600">
              Signed in as{" "}
              <span className="font-medium text-slate-900">{session.user.email}</span>
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Your PDF tools
            </h2>
            <p className="mt-1 text-slate-600">
              Choose a tool below to get started.
            </p>
          </div>

          <ToolsGrid linked />
        </div>
      </main>
    </div>
  );
}
