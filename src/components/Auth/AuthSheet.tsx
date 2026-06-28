import { createPortal } from 'react-dom'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../../lib/supabase'

interface Props {
  onClose: () => void
}

export default function AuthSheet({ onClose }: Props) {
  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-[8000]"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-[8001] bg-white rounded-t-2xl shadow-2xl p-6 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-gray-800">Sign in to contribute</h2>
            <p className="text-xs text-gray-500 mt-0.5">Add places or rate them for the IBD community</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 text-lg font-bold px-2"
            aria-label="Close"
          >✕</button>
        </div>

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: { brand: '#6c3fc5', brandAccent: '#5a32a3' },
                radii: { borderRadiusButton: '12px', inputBorderRadius: '10px' },
              },
            },
          }}
          providers={['google']}
          redirectTo={window.location.origin}
          showLinks={false}
          view="sign_in"
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email',
                password_label: 'Password',
                button_label: 'Continue with email',
                social_provider_text: 'Continue with {{provider}}',
              },
            },
          }}
        />
      </div>
    </>,
    document.body
  )
}
