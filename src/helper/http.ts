import axios, { AxiosInstance } from "axios";

let _http: AxiosInstance | undefined;

const http = (): AxiosInstance => {
    if (_http) return _http;

    _http = axios.create({
        baseURL: "https://api.myquran.com/v2"
    });

    return _http;
}

export { http };