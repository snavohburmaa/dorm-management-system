import { RoleAuthClient } from "./role-auth-client";

export default function RoleAuthPage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  return <RoleAuthClient params={params} />;
}

