export interface RequestBody {
    ping_urls: Array<string>
}

export interface ResponseBody {
    host: string,
    alive: boolean,
    time: number | "unknown";
}