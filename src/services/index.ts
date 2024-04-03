import { AxiosInstance } from "axios";
import { IHttpResponse } from "../interfaces/response";
import { ILocation } from "../interfaces/location";
import { IPrayerSchedule } from "../interfaces/prayer";

export class PrayerService {
    _http: AxiosInstance;

    constructor(http: AxiosInstance) {
        this._http = http;
    }

    getPrayerLocation = async (): Promise<IHttpResponse<ILocation[]>> => {
        try {
            const { data }  = await this._http.get<IHttpResponse<ILocation[]>>("https://api.myquran.com/v2/sholat/kota/semua");
            return data;
        } catch (error) {
            console.error("Failed to fetch prayer location", error);
            throw new Error("Failed to fetch prayer location");
        }
    }

    getPrayerTime = async (id: string, date: string): Promise<IHttpResponse<IPrayerSchedule>> => {
        const { data } = await this._http.get<IHttpResponse<IPrayerSchedule>>(`https://api.myquran.com/v2/sholat/jadwal/${id}/${date}`);
        return data;
    }
}