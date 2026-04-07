import LogoutForm from "@/app/components/auth/Logout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Logout - DevPulse",
};

export default async function Logout() {
  return <LogoutForm />;
}
