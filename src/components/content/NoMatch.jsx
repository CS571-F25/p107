import { Link } from "react-router";

export default function NoMatch() {
    return (
        <div style={{ padding: 8 }}>
            <h2>That's a 404.</h2>
            <p>Uh oh, looks like you're lost!</p>
            <p>
                <Link to="/">Back to safety.</Link>
            </p>
        </div>
    );
}
