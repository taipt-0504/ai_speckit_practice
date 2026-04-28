import { PendingUsersList } from '@/components/admin/PendingUsersList';

export default function AdminUsersPage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold text-gray-900">Pending User Approvals</h1>
      <p className="mt-1 text-sm text-gray-600">Approve or reject newly registered accounts.</p>
      <div className="mt-6">
        <PendingUsersList />
      </div>
    </main>
  );
}
