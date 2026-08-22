import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      email_verified: Date | null;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      wakatime_api_key?: string | null;
    };
  }

  interface User {
    id: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    email_verified?: Date | null;
    wakatime_api_key?: string | null;
  }
}
