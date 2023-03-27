async function fetchApiData(startDate) {
    const apiUrl = 'http://api.rtrend.site:3003/api/symbol/day/insert';
    const today = new Date();
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(today.getMonth() - 2);

    // Loop from today to two months ago
    for (let date = today; date >= twoMonthsAgo; date.setDate(date.getDate() - 1)) {
        console.log(date.toJSON());
        const url = `${apiUrl}?date=${date.toJSON()}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            // Process the data for the current date as needed
            console.log(data);
        } catch (error) {
            console.error(`Error fetching data for ${date}:`, error);
        }
    }
}
fetchApiData(new Date());
