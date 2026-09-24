import Navbar from "@/components/Navbar";
import WatermarkToolClient from "@/components/WatermarkToolClient";

export default function WatermarkPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        <Navbar />
        <main className="px-6 py-12">
          <WatermarkToolClient />
        </main>
      </div>

      <footer className="border-t border-slate-200 bg-white px-6 py-8 mt-12">
        <div className="mx-auto max-w-6xl text-center text-sm text-slate-500">
          © {new Date().getFullYear()} PDFTools. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
