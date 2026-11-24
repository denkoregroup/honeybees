import { describe, expect, it } from "vitest"
import { isNavActive } from "../nav"

const links = ["/", "/shop", "/collections", "/about", "/contact"]
const activeOn = (pathname: string) => links.filter((href) => isNavActive(pathname, href))

describe("isNavActive", () => {
  it("marks only HOME on the home page", () => expect(activeOn("/")).toEqual(["/"]))
  it("marks only SHOP ALL on /shop", () => expect(activeOn("/shop")).toEqual(["/shop"]))
  it("marks only COLLECTIONS on the collections list", () => expect(activeOn("/collections")).toEqual(["/collections"]))
  it("marks only COLLECTIONS on a collection page", () => expect(activeOn("/shop/apparel-1")).toEqual(["/collections"]))
  it("marks only COLLECTIONS on a product page", () => expect(activeOn("/shop/apparel-1/turtley-awesome-tee")).toEqual(["/collections"]))
  it("marks only CONTACT on /contact", () => expect(activeOn("/contact")).toEqual(["/contact"]))
  it("marks nothing on the cart", () => expect(activeOn("/cart")).toEqual([]))
})
