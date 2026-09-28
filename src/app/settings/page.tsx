import type { Metadata } from "next";
import SettingsClient from "./SettingsClient";

export const metadata: Metadata = {
  title: "Settings",
  description: "Appearance, reading preferences, languages, sources and privacy.",
};

export default function SettingsPage() {
  return <SettingsClient />;
}
