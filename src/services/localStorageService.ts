import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, fallbackValue: T) {
    const [value, setValue] = useState<T>(fallbackValue);

    useEffect(() => {
        const stored = localStorage.getItem(key);
        if (!stored)
        {
            console.log("No stored value found for key " + key + ", using fallback value");
            setValue(fallbackValue);
        }
        else
        {
            console.log("Found stored value for key " + key + ", using stored value");
            console.log(stored);
            setValue(JSON.parse(stored) as T);
        }
    }, []);

    useEffect(() => {
        console.log("Storing value for key " + key);
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue] as const;
}