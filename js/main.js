async function getMonitor() {
    try {
        const response = await fetch("https://fe17api-1.onrender.com/monitor");
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error(error);
    }
}
getMonitor();
