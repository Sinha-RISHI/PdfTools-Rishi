import Link from "next/link";
import { tools } from "@/lib/tools";

type ToolsGridProps = {
  linked?: boolean;
};

export default function ToolsGrid({ linked = false }: ToolsGridProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => {
        const cardContent = (
          <>
            <div
              className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${tool.color} p-3 text-white shadow-sm`}
            >
              {tool.icon}
            </div>
            <h3 className="text-lg font-semibold text-slate-900 transition-colors group-hover:text-rose-600">
              {tool.name}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              {tool.description}
            </p>
          </>
        );

        const className =
          "group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md";

        const targetHref = tool.href || (linked ? `/tools/${tool.slug}` : undefined);

        if (targetHref) {
          return (
            <Link
              key={tool.slug}
              href={targetHref}
              className={`${className} cursor-pointer`}
            >
              {cardContent}
            </Link>
          );
        }

        return (
          <div key={tool.slug} className={`${className} cursor-default`}>
            {cardContent}
          </div>
        );
      })}
    </div>
  );
}
