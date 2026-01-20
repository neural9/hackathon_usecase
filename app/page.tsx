import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Link
        href="/portal"
        className="rounded-lg bg-[#14B67A] px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-[#0f9a65]"
      >
        Go to Portal
      </Link>
    </div>
  );
}
