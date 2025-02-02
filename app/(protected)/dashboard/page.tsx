import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log('user', user);

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <main className="flex flex-col gap-6 p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="flex items-center gap-2 p-4 bg-yellow-50 text-yellow-800 rounded-lg">
        <InfoIcon className="w-5 h-5" />
        <p>Welcome, {user.email}</p>
      </div>
    </main>
  );
}
