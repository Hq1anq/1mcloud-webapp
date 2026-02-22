import { useState } from 'react'
import { Link } from 'react-router-dom'
import Input from '../components/ui/Input'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
    // Clear error when user types
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    // TODO: Implement signup logic
    console.log('Signup data:', formData)
  }

  return (
    <div className="flex min-h-[calc(100vh-130px)] items-center justify-center p-4">
      <div className="bg-surface w-full max-w-xl rounded-xl p-8 shadow-2xl">
        <h2 className="text-text-title mb-6 text-center text-2xl font-bold">Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="fullname"
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={formData.fullname}
            onChange={handleChange}
            required
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Input
              id="phone"
              label="Phone Number"
              type="tel"
              placeholder="+1 234 567 8900"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
            />
            <Input
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
            />
          </div>

          <button
            type="submit"
            className="focus:ring-opacity-75 mt-6 w-full rounded-lg bg-green-600 px-4 py-2 font-semibold text-white shadow-md transition-colors hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
          >
            Create Account
          </button>

          <div className="text-text-primary mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-blue-500 hover:text-blue-400 focus:outline-none"
            >
              Log in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
