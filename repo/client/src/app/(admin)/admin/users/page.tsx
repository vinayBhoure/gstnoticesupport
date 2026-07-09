import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { ChevronRight, Users, Search } from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import { adminUserListQuerySchema } from '@/lib/shared-schemas/admin.schema';
import { UserSearch } from '@/components/admin/UserSearch';
import { Pagination } from '@/components/admin/Pagination';
import { RowLink } from '@/components/admin/RowLink';
import { SERVICE_META } from '@/lib/constants/services';

export const metadata: Metadata = {
  title: 'Admin · Users — GST Notice Support',
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function formatMobile(phone: string | null): string {
  if (!phone) return '—';
  const match = phone.match(/^(\d{5})(\d{5})$/);
  return match ? `+91 ${match[1]} ${match[2]}` : phone;
}

// Admin Users per resources/ui/Admin Users.html — search + paginated table.
export default async function AdminUsersPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams;
  const candidate = Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );
  const parsed = adminUserListQuerySchema.safeParse(candidate);
  const query = parsed.success ? parsed.data : adminUserListQuerySchema.parse({});

  const cookieHeader = (await cookies()).toString();
  const { data: users, meta } = await adminApi.listUsers(query, cookieHeader);

  const isSearch = Boolean(query.search);

  return (
    <>
      <div className="page-head" style={{ display: 'block', marginBottom: 24 }}>
        <h1>Users</h1>
        <p className="sub">
          {meta.total} user{meta.total === 1 ? '' : 's'}
        </p>
      </div>

      <UserSearch />

      <div className="table-card">
        {users.length > 0 ? (
          <>
            <div className="table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th scope="col">
                      <span className="th-plain">Name</span>
                    </th>
                    <th scope="col">
                      <span className="th-plain">Email</span>
                    </th>
                    <th scope="col">
                      <span className="th-plain">Mobile</span>
                    </th>
                    <th scope="col">
                      <span className="th-plain">Interested Services</span>
                    </th>
                    <th scope="col" aria-hidden>
                      <span className="th-plain" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <RowLink
                      key={user.id}
                      href={`/admin/users/${user.id}`}
                      ariaLabel={`${user.name} — ${user.email}. Open user.`}
                    >
                      <td>
                        <span className="t-name">{user.name}</span>
                      </td>
                      <td className="t-email">{user.email}</td>
                      <td className="t-mobile">{formatMobile(user.phone)}</td>
                      <td className={`t-services${user.interestedServices.length ? '' : ' empty'}`}>
                        {user.interestedServices.length
                          ? user.interestedServices
                              .map((s) => SERVICE_META[s]?.label ?? s)
                              .join(', ')
                          : '—'}
                      </td>
                      <td className="t-arrow">
                        <ChevronRight className="ic" aria-hidden />
                      </td>
                    </RowLink>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={meta.page}
              limit={meta.limit}
              total={meta.total}
              basePath="/admin/users"
              query={{ search: query.search }}
            />
          </>
        ) : (
          <div className="table-empty">
            {isSearch ? <Search className="ic-big" aria-hidden /> : <Users className="ic-big" aria-hidden />}
            <p>{isSearch ? 'No users match your search.' : 'No users yet.'}</p>
          </div>
        )}
      </div>
    </>
  );
}
