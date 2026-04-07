export default function Input({ value, setValue, placeholder }) {
    return (
        <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            style={{
                width: "100%",
                padding: "10px",
                marginBottom: "10px",
            }}
        />
    );
}