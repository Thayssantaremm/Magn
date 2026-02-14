"use client";
import { useState } from "react";

export default function Signup() {
  const [name, setName] = useState("");
  const [workspace, setWorkspace] = useState("Minha Agência");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ name, workspaceName: workspace, email, password }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j.error ?? "Falha no cadastro");
      return;
    }
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-md rounded-xl border border-magn-border p-6">
        <h1 className="text-2xl font-semibold">Criar conta</h1>
        <p className="mt-1 text-sm text-gray-500">Cria seu workspace e começa.</p>

        <form className="mt-6 space-y-3" onSubmit={submit}>
          <input className="w-full rounded-md border px-3 py-2" placeholder="Seu nome"
            value={name} onChange={(e)=>setName(e.target.value)} />
          <input className="w-full rounded-md border px-3 py-2" placeholder="Nome do workspace (agência)"
            value={workspace} onChange={(e)=>setWorkspace(e.target.value)} />
          <input className="w-full rounded-md border px-3 py-2" placeholder="Email"
            value={email} onChange={(e)=>setEmail(e.target.value)} />
          <input className="w-full rounded-md border px-3 py-2" placeholder="Senha" type="password"
            value={password} onChange={(e)=>setPassword(e.target.value)} />
          {err ? <div className="text-sm text-red-600">{err}</div> : null}
          <button className="w-full rounded-md bg-magn-green px-3 py-2 font-medium text-magn-black">Criar</button>
        </form>

        <div className="mt-4 text-sm">
          Já tem conta? <a className="underline" href="/login">Entrar</a>
        </div>
      </div>
    </div>
  );
}
