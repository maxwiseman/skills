"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Installer = "claude" | "codex";

interface InstallPreferenceStore {
	installer: Installer;
	setInstaller: (installer: Installer) => void;
}

export const useInstallPreferenceStore = create<InstallPreferenceStore>()(
	persist(
		(set) => ({
			installer: "claude",
			setInstaller: (installer) => set({ installer }),
		}),
		{
			name: "install-preference",
		}
	)
);
