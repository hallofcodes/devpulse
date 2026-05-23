import LogoutForm from "@/app/components/auth/Logout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Logout - Devpulse",
};

export default async function Logout() {
  return <LogoutForm />;
}
