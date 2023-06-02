export default function SelectionBox({ label, name, options, handleChange, value }) {
    return (
        <div>
            <label className="text-gray-800 mx-2">{label}</label>
            <select
                name={name}
                className="block w-full px-4 py-2 mt-2 border rounded-md bg-gray-300 text-gray-600 border-gray-600 focus:border-blue-500 focus:outline-none focus:ring"
                onChange={handleChange}
                value={value || options[0]}
            >
                {
                    options.map((option, index) => {
                        return (
                            <option key={index}>{option}</option>
                        )
                    })
                }
            </select>
        </div>
    )
}