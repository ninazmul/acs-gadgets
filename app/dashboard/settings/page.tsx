import React from "react";
import { getSetting, upsertSetting } from "@/lib/actions/setting.actions";
import SettingForm, { SettingFormValues } from "../components/SettingForm";

export default async function SettingsPage() {
  const setting = await getSetting();

  async function onSubmit(data: SettingFormValues) {
    "use server";
    await upsertSetting(data);
  }

  return (
    <main className="p-4 min-h-screen">
      <SettingForm initialData={setting ?? undefined} onSubmit={onSubmit} />
    </main>
  );
}
