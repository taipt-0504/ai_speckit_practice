export default function WaitingApprovalPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Awaiting approval</h1>
        <p className="mt-2 text-sm text-gray-600">
          Your account is pending admin approval. You can login after your status becomes active.
        </p>
      </div>
    </div>
  );
}
