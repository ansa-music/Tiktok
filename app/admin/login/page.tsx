import { LoginForm } from "@/components/admin/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="card w-full max-w-sm p-6 sm:p-8">
        <h1 className="text-xl font-bold">Вход в админ-панель</h1>
        <p className="mt-1 text-sm text-slate-500">Введите пароль владельца сайта.</p>
        <LoginForm />
      </div>
    </main>
  );
}
