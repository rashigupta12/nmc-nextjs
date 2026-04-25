/* eslint-disable @typescript-eslint/no-unused-vars */


"use client";


import { Role } from "@/validaton-schema";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { ClipLoader } from "react-spinners";

type UserRole = Role | 'VENDOR';

interface Props {
  children: ReactNode;
  allowedRoles: UserRole[];
}

export function withRole<P>({ children, allowedRoles }: Props) {
  return function RoleHOC(props: P) {
    const { data: session, status } = useSession();
    const router = useRouter();

    if (status === "loading") {
      return <ClipLoader />;
    }

    const userRole = session?.user?.role as UserRole | undefined;
    if (!session || !userRole || !allowedRoles.includes(userRole)) {
      router.push("/auth/login");
      return null;
    }

    return <>{children}</>;
  };
}
