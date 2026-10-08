import type { Metadata } from "next";
import { LatestUpdatesView } from "./latest-updates-view";

export const metadata: Metadata = { title: "Latest Updates" };

export default function Page() {
  return <LatestUpdatesView />;
}
