import { getOrCreateUser } from "@/lib/user";

export default async function PortalPage() {
  const user = await getOrCreateUser();

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Welcome Card */}
        <div className="col-span-full rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-gray-600">
            Manage your accounts and services from your personal dashboard.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900">Accounts</h3>
          <p className="mt-1 text-sm text-gray-600">
            View and manage your bank accounts
          </p>
          <button className="mt-4 rounded-md bg-[#1d8348] px-4 py-2 text-sm font-medium text-white hover:bg-[#166638]">
            View accounts
          </button>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900">Payments</h3>
          <p className="mt-1 text-sm text-gray-600">
            Make payments and transfers
          </p>
          <button className="mt-4 rounded-md bg-[#1d8348] px-4 py-2 text-sm font-medium text-white hover:bg-[#166638]">
            Make a payment
          </button>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900">Cards</h3>
          <p className="mt-1 text-sm text-gray-600">
            Manage your debit and credit cards
          </p>
          <button className="mt-4 rounded-md bg-[#1d8348] px-4 py-2 text-sm font-medium text-white hover:bg-[#166638]">
            Manage cards
          </button>
        </div>

        <div className="rounded-lg border-2 border-[#1d8348] bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900">Business Loan</h3>
          <p className="mt-1 text-sm text-gray-600">
            Apply for a business loan to grow your company
          </p>
          <div className="mt-4 flex gap-2">
            <a
              href="/portal/apply"
              className="inline-block rounded-md bg-[#1d8348] px-4 py-2 text-sm font-medium text-white hover:bg-[#166638]"
            >
              Start application
            </a>
            <a
              href="/portal/applications"
              className="inline-block rounded-md border border-[#1d8348] px-4 py-2 text-sm font-medium text-[#1d8348] hover:bg-[#1d8348]/10"
            >
              View applications
            </a>
          </div>
        </div>

        {user?.role === "REVIEWER" && (
          <div className="rounded-lg border-2 border-blue-600 bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900">Review Applications</h3>
            <p className="mt-1 text-sm text-gray-600">
              Review and process submitted loan applications
            </p>
            <a
              href="/portal/review"
              className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Review applications
            </a>
          </div>
        )}
      </div>

      {/* Debug info - remove in production */}
      <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="text-xs text-gray-500">
          User: {user?.name || user?.email} | Role: {user?.role}
        </p>
      </div>
    </main>
  );
}
