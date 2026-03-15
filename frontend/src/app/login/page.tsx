import LoginForm from "@/components/login/LoginForm";

export default function LoginPage() {
  return (
    // This replicates the custom linear-gradient background from your CSS
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#10b77f20] to-[#0ea5e910] p-4 font-display">
      <LoginForm />
    </div>
  );
}