import type { Metadata } from "next";
import { BooksView } from "./books-view";

export const metadata: Metadata = { title: "Books" };

export default function Page() {
  return <BooksView />;
}
