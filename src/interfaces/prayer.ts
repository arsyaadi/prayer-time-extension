import dayjs from "dayjs";

export interface ISchedule {
  tanggal: string;
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
}

export interface IPrayerSchedule {
  daerah: string;
  id: number;
  jadwal: ISchedule;
  lokasi: string;
}

export interface IPrayerTime {
  name: string;
  time: dayjs.Dayjs;
}