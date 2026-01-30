import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Input from '../components/ui/Input'
import Checkbox from '../components/ui/Checkbox'
import useAuthStore from '../store/useAuthStore'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const login = useAuthStore((state) => state.login)
  const isLoading = useAuthStore((state) => state.isLoading)

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }))
    // Clear error when user types
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const success = await login(formData.email, formData.password)

    if (success) {
      navigate('/')
    } else {
      const storeError = useAuthStore.getState().error
      setError(storeError || 'Login failed. Please check your credentials.')
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-130px)] items-center justify-center p-4">
      <div className="bg-surface w-full max-w-md rounded-xl p-8 shadow-2xl">
        <h2 className="text-text-title mb-6 text-center text-2xl font-bold">Login</h2>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={isLoading}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={formData.remember}
                onChange={(e) => setFormData((prev) => ({ ...prev, remember: e.target.checked }))}
                disabled={isLoading}
              />
              <span
                className="text-text-secondary cursor-pointer text-sm"
                onClick={() =>
                  !isLoading && setFormData((prev) => ({ ...prev, remember: !prev.remember }))
                }
              >
                Remember me
              </span>
            </div>
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-blue-500 hover:text-blue-400"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`focus:ring-opacity-75 w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-md transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
              isLoading ? 'cursor-not-allowed opacity-70' : ''
            }`}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>

          <div className="text-text-secondary mt-4 text-center text-sm">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-medium text-blue-500 hover:text-blue-400 focus:outline-none"
            >
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
