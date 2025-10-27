export default function Now() {
    // 📝 Remember to update this date when you change the content below
    const lastUpdated = "October 27, 2025";
    
    return (
        <div style={{ maxWidth: 800, padding: '1rem' }}>
            <h1>What I'm Up To Now</h1>
            <p style={{ color: '#666', fontSize: '0.9em' }}>
                Last updated: {lastUpdated}
            </p>

            <h2>Madison</h2>
            <p>I'm currently in Madison finishing my Computer Science & Data Science studies at UW-Madison. Most of my time is focused on hands-on data analysis projects and earning a Consulting Certificate. I'm exploring how technology and analytics drive practical business results and preparing to move into a data or business analyst role.</p>

            <p>Inspired by: <a href="https://sive.rs/">Derek Sivers</a>'s <a href="https://nownownow.com/about">nownownow.com</a>.
            </p>
        </div>
    );
}