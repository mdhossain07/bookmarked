import type { Metadata } from "next";
import { MoviesView } from "./movies-view";

export const metadata: Metadata = { title: "Movies" };

export default function Page() {
  return <MoviesView />;
}
