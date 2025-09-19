import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';
import { MessageCircle } from 'lucide-react';

export default function Login() {
    const router = useRouter();

    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session) {
                // Allow login langsung dari auth.users untuk admin
                router.push('/');
            }
        });
        return () => authListener.subscription.unsubscribe();
    }, [router]); return (
        <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-white">
                        <MessageCircle className="h-6 w-6 text-green-500" />
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-white">
                        WhatsApp API Admin
                    </h2>
                    <p className="mt-2 text-sm text-white/80">
                        Sign in to manage your WhatsApp API users
                    </p>
                </div>
                <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
                    <Auth
                        supabaseClient={supabase}
                        appearance={{
                            theme: ThemeSupa,
                            variables: {
                                default: {
                                    colors: {
                                        brand: '#10B981',
                                        brandAccent: '#059669',
                                    },
                                },
                            },
                        }}
                        providers={['google', 'github']}
                        onlyThirdPartyProviders={false}
                    />
                </div>
            </div>
        </div>
    );
}