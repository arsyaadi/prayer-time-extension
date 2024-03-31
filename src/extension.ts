import * as vscode from "vscode";
import { PrayerService } from "./services";
import { http } from "./helper/http";
import { displayPrayerTime, getCurrentAndNextPrayerTime, getCurrentDateFormatted } from "./utils";
import dayjs from "dayjs";
import { PrayerCommand } from "./contants";



let prayerStatusBarItem: vscode.StatusBarItem;
const _http = http();
const services = new PrayerService(_http);

const init = async (context: vscode.ExtensionContext) => {
  const persistPrayerLocation = context.workspaceState.get("prayerLocation");

  if (!persistPrayerLocation) {
    try {
      const { data } = await services.getPrayerLocation();
      const prayerTimeLocations = data.map(location => {
        return {
          label: location.lokasi,
          id: location.id,
        }
      })
  
      const prayerLocation = await vscode.window.showQuickPick(prayerTimeLocations, {
        matchOnDescription: true,
        placeHolder: "Select your location"
      });
  
      if (prayerLocation) {
        context.workspaceState.update("prayerLocation", prayerLocation);
      }
    } catch (error) {
      console.error("Error fetching prayer location", error)
      vscode.window.showErrorMessage("Failed to fetch prayer location, Please try again later.")
    }
  }
}


const setPrayerLocation = async (context: vscode.ExtensionContext) => {

  try {
    const { data } = await services.getPrayerLocation();
    const prayerTimeLocations = data.map(location => {
      return {
        label: location.lokasi,
        id: location.id,
      }
    })
  
    const prayerLocation = await vscode.window.showQuickPick(prayerTimeLocations, {
      matchOnDescription: true,
      placeHolder: "Select your location"
    });
  
    if (prayerLocation) {
      context.workspaceState.update("prayerLocation", prayerLocation);
    }

    // Fetch prayer time
    await onFetch(context)

  } catch (error) {
    console.error("Error fetching prayer location", error)
    vscode.window.showErrorMessage("Failed to fetch prayer location, Please try again later.")
  }
}

const onFetch = async (context: vscode.ExtensionContext) => {
  const persistPrayerLocation = context.workspaceState.get("prayerLocation");

  if (!persistPrayerLocation) {
    vscode.window.showErrorMessage("Please select a prayer location first");
    return;
  }

  try {
    const { data } = await services.getPrayerTime((persistPrayerLocation as { id: string }).id, getCurrentDateFormatted())
    const currentPrayer = getCurrentAndNextPrayerTime(data)

    if (!currentPrayer.currentPrayer) {
      prayerStatusBarItem.text = `[${currentPrayer.nextPrayer.name}: ${dayjs(currentPrayer.nextPrayer.time).format("HH:mm")}]`;
    } else {
      prayerStatusBarItem.text = `[${currentPrayer.currentPrayer.name}: ${dayjs(currentPrayer.currentPrayer.time).format("HH:mm")}]`;
    }
    
    prayerStatusBarItem.show();
  } catch (error) {
    console.error("Error fetching prayer schedule", error)
    vscode.window.showErrorMessage("Failed to fetch prayer schedule, Please try again later.")
  }
}

const showPrayerTime = async (context: vscode.ExtensionContext) => {
  const persistPrayerLocation = context.workspaceState.get("prayerLocation");

  if (!persistPrayerLocation) {
    vscode.window.showErrorMessage("Please select a prayer location first");
    return;
  }

  try {
    const { data } = await services.getPrayerTime((persistPrayerLocation as { id: string }).id, getCurrentDateFormatted());

    displayPrayerTime(data);
  } catch (error) {
    console.error("Error fetching prayer schedule", error)
    vscode.window.showErrorMessage("Failed to fetch prayer schedule, Please try again later.")
  }
}


export async function activate(context: vscode.ExtensionContext) {
  prayerStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);

  await init(context);


  const setPrayerLocationCommand = vscode.commands.registerCommand(
    PrayerCommand.SELECT_PRAYER_LOCATION,
    async () => {
      await setPrayerLocation(context);
    }
  );


  const refreshPrayerTimeCommand = vscode.commands.registerCommand(
    PrayerCommand.REFRESH_PRAYER_TIME,
    async () => {
      await onFetch(context);
    }
  );

  const showPrayerTimeCommand = vscode.commands.registerCommand(
    PrayerCommand.SHOW_PRAYER_TIME,
    async () => {
      await showPrayerTime(context);
    }
  )

  context.subscriptions.push(setPrayerLocationCommand, refreshPrayerTimeCommand);
  context.subscriptions.push(showPrayerTimeCommand);

  await onFetch(context);

  setInterval(async () => {
    console.log("Fetching prayer time")
    await onFetch(context);
  }, 60000)
}

export function deactivate() {}
