import LogoutForm from "@/app/components/auth/Logout";
import { Metadata } from "next/types";

export const metadata: Metadata = {
  title: "Logout - Devpulse",
};

export default async function Logout() {
  return <LogoutForm />;
}
