import * as vscode from "vscode";
import { IPrayerSchedule } from "../interfaces/prayer";
import dayjs from "dayjs";

export const getCurrentDateFormatted = (): string => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = ("0" + (currentDate.getMonth() + 1)).slice(-2); // Adding 1 because getMonth() returns zero-based month
  const day = ("0" + currentDate.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
};


export const displayPrayerTime = (scheduleData: IPrayerSchedule) => {
  const outputChannel = vscode.window.createOutputChannel("Prayer Schedule");

  if (scheduleData.jadwal) {
    const jadwal = scheduleData.jadwal;
    const formattedJadwal = `                           
   ┌───────────────────────────────────────┐
   │ Location: ${scheduleData.lokasi.padEnd(28)}│
   │ Area: ${scheduleData.daerah.padEnd(32)}│
   │ Date: ${jadwal.tanggal.padEnd(32)}│
   │ Imsak: ${jadwal.imsak.padEnd(27)}    │
   │ Fajr: ${jadwal.subuh.padEnd(28)}    │
   │ Sunrise: ${jadwal.terbit.padEnd(27)}  │
   │ Duha: ${jadwal.dhuha.padEnd(28)}    │
   │ Dhuhr: ${jadwal.dzuhur.padEnd(29)}  │
   │ Asr: ${jadwal.ashar.padEnd(29)}    │
   │ Maghrib: ${jadwal.maghrib.padEnd(29)}│
   │ Isha: ${jadwal.isya.padEnd(26)}      │
   ╰───────────────────────────────────────╯`;

    outputChannel.appendLine(formattedJadwal);
  } else {
    outputChannel.appendLine("Failed to retrive prayer schedule data");
  }

  outputChannel.show();
};

export const getCurrentAndNextPrayerTime = (prayerData: IPrayerSchedule) => {
  const currentDateTime = dayjs();
  const prayerTimes = [
    {name: "Imsak", time: parseTimeString(prayerData.jadwal.imsak)},
    {name: "Fajr", time: parseTimeString(prayerData.jadwal.subuh)},
    {name: "Sunrise", time: parseTimeString(prayerData.jadwal.terbit)},
    {name: "Duha", time: parseTimeString(prayerData.jadwal.dhuha)},
    {name: "Dzuhr", time: parseTimeString(prayerData.jadwal.dzuhur)},
    {name: "Asr", time: parseTimeString(prayerData.jadwal.ashar)},
    {name: "Maghrib", time: parseTimeString(prayerData.jadwal.maghrib)},
    {name: "Isha", time: parseTimeString(prayerData.jadwal.isya)},
  ]

  let currentPrayerIndex = -1;
  let nextPrayerIndex = 0;


  // find current and next prayer time
  for (let i = 0; i < prayerTimes.length; i++) {
    if (currentDateTime.isBefore(prayerTimes[i].time)) {
      nextPrayerIndex = i;
      break
    }
    currentPrayerIndex = i;
  }
  

  const currentPrayer = currentPrayerIndex === -1 ? prayerTimes[prayerTimes.length] : null
  const nextPrayer = prayerTimes[nextPrayerIndex];

  return {currentPrayer, nextPrayer}
}

export const parseTimeString = (timeString: string) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  return dayjs().set("hour", hours).set("minute", minutes);

}