import { AppConfig } from "@/app.config";
import Link from "next/link";

export default function Header() {
  return (
    <header className="flex gap-2 items-center h-14 px-6">
      <Link href="/" className="font-black text-xl">
        {AppConfig.title}
      </Link>
      <span className="flex-1"></span>
    </header>
  );
}
