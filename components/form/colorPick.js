export default function ColorPicker({label = 'Color', name, handleChange}) {
    return (
        <div>
            <label className="block mb-1 text-sm font-medium text-gray-900">{label}</label>
            <input
                name={name}
                type="color"
                className="block w-8 mt-2 rounded-full border-gray-600 focus:border-blue-500 focus:outline-none focus:ring"
                onChange={handleChange}
            />
        </div>
    )
}