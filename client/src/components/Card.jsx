export default function Card({ item }) {
    return (
        <div
            style={{
                border: "1px solid #ddd",
                padding: "10px",
                marginBottom: "10px",
            }}
        >
            <h3>{item.title}</h3>
            <p>{item.content}</p>
        </div>
    );
}