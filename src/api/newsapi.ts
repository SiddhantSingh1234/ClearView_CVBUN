const BASE_URL = "http://127.0.0.1:5000"; // Flask backend URL

export async function fetchNews() {
    try {
        const response = await fetch(`${BASE_URL}/news`);
        if (!response.ok) {
            throw new Error("Failed to fetch news");
        }
        const data = await response.json();
        return data; // This should be an array of news articles
    } catch (error) {
        console.error("Error fetching news:", error);
        return [];
    }
}