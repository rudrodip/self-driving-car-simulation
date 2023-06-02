import { useState } from "react"

const PasswordInputField = ({ label = 'Password', name, handleChange, showPassToggle = false }) => {
    const [checked, setChecked] = useState(false)

    // password show state change handler
    const handleOnChange = () => {
        setChecked(!checked)
    }

    return (
        <div>
            <label className="text-white dark:text-gray-200">{label}</label>
            <input
                name={name}
                type={checked ? 'text' : 'password'}
                className="block w-full px-4 py-2 mt-2 border rounded-md bg-gray-800 text-gray-300 border-gray-600 focus:border-blue-500 focus:outline-none focus:ring"
                onChange={handleChange}
            />
            {
                showPassToggle &&

                <div className='text-sm text-gray-200 mt-3 flex items-center'>
                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={handleOnChange}
                        className="checkbox checkbox-info"
                    />
                    <label className="ml-2 text-sm font-medium text-gray-300">Show Password</label>
                </div>
            }
        </div >
    )
}

export default PasswordInputField