import { describe, expect, it } from "vitest";
import { z } from "zod";
import { containsText, equalsText, parseQuery } from "@/server/http/validate";

describe("parseQuery", () => {
  const schema = z.object({ status: z.union([z.string(), z.array(z.string())]).optional(), q: z.string().optional() });

  it("turns a repeated key into an array", () => {
    const query = parseQuery(new Request("http://x.test/?status=read&status=reading&q=a"), schema);
    expect(query).toEqual({ status: ["read", "reading"], q: "a" });
  });

  it("keeps a single key as a string", () => {
    expect(parseQuery(new Request("http://x.test/?status=read"), schema)).toEqual({ status: "read" });
  });
});

describe("text matching (S1)", () => {
  it("treats regex characters literally", () => {
    expect(containsText("C++").test("Learning C++ today")).toBe(true);
    expect(containsText("C++").test("Learning C today")).toBe(false);
    expect(equalsText("Se7en (1995)").test("se7en (1995)")).toBe(true);
    expect(equalsText("a.c").test("abc")).toBe(false);
  });
});
