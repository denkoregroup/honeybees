// Which top-level nav link the current page belongs to. Collection and product pages live under
// /shop/<collection>, but visitors reach them from Collections, so they mark COLLECTIONS, not SHOP ALL.
export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/" || href === "/shop") return pathname === href
  if (href === "/collections") return pathname === "/collections" || pathname.startsWith("/shop/")
  return pathname === href || pathname.startsWith(`${href}/`)
}
