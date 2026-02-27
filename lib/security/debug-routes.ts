export const DEBUG_ROUTES = ['/check-database', '/test-connection', '/test-notifications'] as const;

export function isDebugRoute(pathname: string): boolean {
  return DEBUG_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}
