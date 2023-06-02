const RangeSlider = ({ label, name, handleChange, value, min, max, step }) => {
  return (
    <div>
      <label className="block mb-1 text-sm font-medium text-gray-900">{label} ({value})</label>
      <input
        name={name}
        type="range"
        min={min}
        max={max}
        value={value}
        step={step}
        className="w-full h-2 bg-white rounded-lg appearance-none cursor-pointer"
        onChange={handleChange}
      />
    </div>
  )
}

export default RangeSlider