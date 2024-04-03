import * as vscode from "vscode";
import dayjs from "dayjs";

import { PrayerService } from "./services";
import { http } from "./helper/http";
import {
  displayPrayerTime,
  getCurrentAndNextPrayerTime,
  getCurrentDateFormatted,
  remainingTimePrayer,
} from "./utils";
import { PrayerCommand } from "./contants";

let prayerStatusBarItem: vscode.StatusBarItem;
const _http = http();
const services = new PrayerService(_http);

const init = async (context: vscode.ExtensionContext) => {
  const persistPrayerLocation = context.workspaceState.get("prayerLocation");

  if (!persistPrayerLocation) {
    try {
      const { data } = await services.getPrayerLocation();
      const prayerTimeLocations = data.map((location) => {
        return {
          label: location.lokasi,
          id: location.id,
        };
      });

      const prayerLocation = await vscode.window.showQuickPick(
        prayerTimeLocations,
        {
          matchOnDescription: true,
          placeHolder: "Select your location",
        }
      );

      if (prayerLocation) {
        context.workspaceState.update("prayerLocation", prayerLocation);
      }
    } catch (error) {
      console.error("Error fetching prayer location", error);
    }
  }
};

const setPrayerLocation = async (context: vscode.ExtensionContext) => {
  try {
    const { data } = await services.getPrayerLocation();
    const prayerTimeLocations = data.map((location) => {
      return {
        label: location.lokasi,
        id: location.id,
      };
    });

    const prayerLocation = await vscode.window.showQuickPick(
      prayerTimeLocations,
      {
        matchOnDescription: true,
        placeHolder: "Select your location",
      }
    );

    if (prayerLocation) {
      context.workspaceState.update("prayerLocation", prayerLocation);
    }

    // Fetch prayer time
    await onFetch(context);
  } catch (error) {
    console.error("Error fetching prayer location", error);
  }
};

const onFetch = async (context: vscode.ExtensionContext) => {
  const persistPrayerLocation = context.workspaceState.get("prayerLocation");
  const isSetReminder = context.workspaceState.get("showReminder");

  if (!persistPrayerLocation) {
    vscode.window.showErrorMessage("Please select a prayer location first");
    return;
  }

  try {
    const { data } = await services.getPrayerTime(
      (persistPrayerLocation as { id: string }).id,
      getCurrentDateFormatted()
    );
    const currentPrayer = getCurrentAndNextPrayerTime(data);

    if (!currentPrayer.currentPrayer) {
      prayerStatusBarItem.text = `[${currentPrayer.nextPrayer.name}: ${dayjs(
        currentPrayer.nextPrayer.time
      ).format("HH:mm")}]`;
    } else {
      prayerStatusBarItem.text = `[${currentPrayer.currentPrayer.name}: ${dayjs(
        currentPrayer.currentPrayer.time
      ).format("HH:mm")}]`;
    }

    console.log(isSetReminder, "isSetReminder");

    // Show remaining time to next prayer
    if (isSetReminder) {
      remainingTimePrayer(currentPrayer.nextPrayer);
    }

    prayerStatusBarItem.accessibilityInformation = {
      label: currentPrayer.currentPrayer?.name as string,
      role: "button",
    };

    prayerStatusBarItem.command = PrayerCommand.SHOW_PRAYER_TIME;

    prayerStatusBarItem.tooltip = data.lokasi;

    prayerStatusBarItem.show();
  } catch (error) {
    console.error("Error fetching prayer schedule", error);
  }
};

const showPrayerTime = async (context: vscode.ExtensionContext) => {
  const persistPrayerLocation = context.workspaceState.get("prayerLocation");

  if (!persistPrayerLocation) {
    vscode.window.showErrorMessage("Please select a prayer location first");
    return;
  }

  try {
    const { data } = await services.getPrayerTime(
      (persistPrayerLocation as { id: string }).id,
      getCurrentDateFormatted()
    );

    displayPrayerTime(data);
  } catch (error) {
    console.error("Error fetching prayer schedule", error);
  }
};

const setReminderTime = async (context: vscode.ExtensionContext) => {
  const choice = await vscode.window.showInformationMessage(
    "Do you want to set reminder for next prayer time?",
    "Yes",
    "No"
  );

  if (choice === "Yes") {
    context.workspaceState.update("showReminder", true);
  } else if (choice === "No") {
    context.workspaceState.update("showReminder", false);
  } else {
    return;
  }

  onFetch(context);
};

export async function activate(context: vscode.ExtensionContext) {
  prayerStatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );

  await init(context);

  const setPrayerLocationCommand = vscode.commands.registerCommand(
    PrayerCommand.SELECT_PRAYER_LOCATION,
    async () => {
      await setPrayerLocation(context);
    }
  );

  const showPrayerTimeCommand = vscode.commands.registerCommand(
    PrayerCommand.SHOW_PRAYER_TIME,
    async () => {
      await showPrayerTime(context);
    }
  );

  const setReminderTimeCommand = vscode.commands.registerCommand(
    PrayerCommand.SET_REMINDER_PRAYER_TIME,
    async () => {
      await setReminderTime(context);
    }
  );

  context.subscriptions.push(setPrayerLocationCommand, showPrayerTimeCommand);
  context.subscriptions.push(setReminderTimeCommand);

  await onFetch(context);

  setInterval(async () => {
    console.log("Fetching prayer time");
    await onFetch(context);
  }, 60000);
}

export function deactivate() {}
