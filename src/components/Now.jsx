export default function Now() {
    const lastUpdated = "October 25, 2025"; // Example date, replace with actual last updated date
    return (
        <div>
            <h1>What I'm Up To Now</h1>
            

            <p>Last updated: {lastUpdated}</p>
            <p>Inspired by: <a href="https://sive.rs/">Derek Sivers</a>'s <a href="https://nownownow.com/about">nownownow.com</a>.
            </p>
        </div>
    );
}